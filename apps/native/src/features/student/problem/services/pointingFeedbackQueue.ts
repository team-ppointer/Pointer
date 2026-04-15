/**
 * 포인팅 피드백 응답을 서버에 반영하는 in-memory 큐.
 *
 * - UI는 즉시 반응(optimistic) — enqueue는 fire-and-forget
 * - 성공 시 dequeue + `onSuccess` 콜백 (React Query invalidate 등의 훅업 지점)
 * - 실패는 HTTP 상태코드로 분류 (`analyticsClient` 패턴 미러):
 *   2xx → success, 401/403 → hold, 그 외 4xx → drop, 5xx/network → retry
 * - Retry backoff: [1, 2, 4, 8, 16, 30]s (6회 이후 30s cap, 무한 재시도)
 * - AsyncStorage 영속성 없음(in-memory only) — 앱 재시작 시 초기화
 */
import type { PendingPointingAnswer } from '../transforms/contentRendererTransforms';

export type PointingStep = 'question' | 'confirm';

export interface PointingQueueEntry extends PendingPointingAnswer {
  /** `${publishId}:${pointingId}:${step}` — 동일 key 재enqueue 시 최신값 overwrite. */
  key: string;
  publishId: number;
  attempt: number;
  nextAttemptAt: number;
}

export type FlushOutcome = 'success' | 'hold' | 'drop' | 'retry';

export type QueuePoster = (entry: PointingQueueEntry) => Promise<FlushOutcome>;

/** 5xx/network 실패 시 다음 재시도까지 대기 시간(ms). attempt는 1부터 (첫 실패=1). */
export function backoffDelayMs(attempt: number): number {
  if (attempt <= 0) return 0;
  return Math.min(1000 * 2 ** (attempt - 1), 30_000);
}

/** 401/403 hold 시 대기 시간 — 인증 갱신 전이므로 너무 자주 리트라이하지 않음. */
const HOLD_DELAY_MS = 10_000;

export function keyOf(publishId: number, pointingId: number, step: PointingStep): string {
  return `${publishId}:${pointingId}:${step}`;
}

export class PointingFeedbackQueue {
  private readonly entries = new Map<string, PointingQueueEntry>();
  private readonly listeners = new Set<() => void>();
  private flushLock = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onSuccessCallback: ((entry: PointingQueueEntry) => void) | undefined;

  constructor(private readonly poster: QueuePoster) {}

  enqueue(args: {
    publishId: number;
    pointingId: number;
    step: PointingStep;
    value: boolean;
  }): void {
    const key = keyOf(args.publishId, args.pointingId, args.step);
    const entry: PointingQueueEntry = {
      key,
      publishId: args.publishId,
      pointingId: args.pointingId,
      step: args.step,
      value: args.value,
      attempt: 0,
      nextAttemptAt: Date.now(),
    };
    this.entries.set(key, entry);
    this.notify();
    this.scheduleFlush(0);
  }

  /** 현재 큐 상태 스냅샷 (UI `toUserAnswers` merge 소비용). */
  snapshot(): PointingQueueEntry[] {
    return [...this.entries.values()];
  }

  /** 큐 변화 구독. 반환 함수 호출로 해제. */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  /** 성공 dequeue 시 호출될 콜백 지정. React Query invalidate 훅업 등에 사용. */
  setOnSuccess(fn: ((entry: PointingQueueEntry) => void) | undefined): void {
    this.onSuccessCallback = fn;
  }

  /** 테스트 헬퍼: 내부 timer/entries 정리 (실서비스에서는 사용하지 않음). */
  _reset(): void {
    this.entries.clear();
    this.listeners.clear();
    this.onSuccessCallback = undefined;
    this.flushLock = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      fn();
    });
  }

  private scheduleFlush(ms: number): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, ms);
  }

  private scheduleNext(): void {
    if (this.entries.size === 0) return;
    const nextAt = Math.min(...[...this.entries.values()].map((e) => e.nextAttemptAt));
    const delay = Math.max(0, nextAt - Date.now());
    this.scheduleFlush(delay);
  }

  private async flush(): Promise<void> {
    if (this.flushLock) return;
    this.flushLock = true;
    try {
      const flushStartedAt = Date.now();
      const due = [...this.entries.values()].filter((e) => e.nextAttemptAt <= flushStartedAt);

      for (const entry of due) {
        const outcome = await this.poster(entry);
        this.applyOutcome(entry, outcome, Date.now());
      }
    } finally {
      this.flushLock = false;
      this.scheduleNext();
    }
  }

  private applyOutcome(
    originalEntry: PointingQueueEntry,
    outcome: FlushOutcome,
    now: number
  ): void {
    const current = this.entries.get(originalEntry.key);

    // 큐 처리 중 동일 key 로 새 값이 enqueue 된 경우: 이번 outcome 은 stale →
    // 스킵하고 다음 flush 가 최신 entry 처리하도록 한다 (attempt/value 비교로 판별).
    // entries 맵이 그대로이므로 notify 도 호출하지 않는다 (snapshot 결과 동일 → 불필요한 리렌더 방지).
    if (
      !current ||
      current.attempt !== originalEntry.attempt ||
      current.value !== originalEntry.value
    ) {
      return;
    }

    switch (outcome) {
      case 'success':
        this.entries.delete(originalEntry.key);
        this.onSuccessCallback?.(originalEntry);
        break;
      case 'drop':
        // 서버 스키마 drift 등 영구 실패로 간주. 로그만 남기고 dequeue.
        console.warn('[pointing-queue] drop entry', {
          key: originalEntry.key,
          attempt: originalEntry.attempt,
        });
        this.entries.delete(originalEntry.key);
        break;
      case 'hold':
        // 401/403: attempt 증가 없이 HOLD_DELAY_MS 후 재시도.
        current.nextAttemptAt = now + HOLD_DELAY_MS;
        break;
      case 'retry':
        current.attempt += 1;
        current.nextAttemptAt = now + backoffDelayMs(current.attempt);
        break;
    }

    this.notify();
  }
}
