/**
 * 버블 ? 버튼 클릭을 서버에 반영하는 in-memory 큐.
 *
 * - UI는 즉시 반응(optimistic) — enqueue는 fire-and-forget
 * - 성공 시 dequeue + `onSuccess` 콜백 (React Query invalidate 등의 훅업 지점)
 * - 실패는 HTTP 상태코드로 분류 (pointingFeedbackQueue 패턴 미러):
 *   2xx → success, 401/403 → hold, 그 외 4xx → drop, 5xx/network → retry
 * - Retry backoff: [1, 2, 4, 8, 16, 30]s (6회 이후 30s cap, 무한 재시도)
 * - AsyncStorage 영속성 없음(in-memory only) — 앱 재시작 시 초기화
 *
 * // First-press is a single bubble-level boolean, no step axis (vs pointingFeedbackQueue
 * // which has step). See plan §3.E3.
 */

export interface BubbleQuestionPressEntry {
  /** `${publishId}:${bubbleId}` — BE-2: bubble.id is globally unique, so 2-tuple key suffices. */
  key: string;
  publishId: number;
  bubbleId: number;
  attempt: number;
  nextAttemptAt: number;
}

export type BubbleQuestionFlushOutcome = 'success' | 'hold' | 'drop' | 'retry';

export type BubbleQuestionPoster = (
  entry: BubbleQuestionPressEntry
) => Promise<BubbleQuestionFlushOutcome>;

/** 5xx/network 실패 시 다음 재시도까지 대기 시간(ms). attempt는 1부터 (첫 실패=1). */
export function bubbleBackoffDelayMs(attempt: number): number {
  if (attempt <= 0) return 0;
  return Math.min(1000 * 2 ** (attempt - 1), 30_000);
}

/** 401/403 hold 시 대기 시간 — 인증 갱신 전이므로 너무 자주 리트라이하지 않음. */
const HOLD_DELAY_MS = 10_000;

export function bubbleQuestionKeyOf(publishId: number, bubbleId: number): string {
  return `${publishId}:${bubbleId}`;
}

export class BubbleQuestionPressQueue {
  private readonly entries = new Map<string, BubbleQuestionPressEntry>();
  // First-press only: once a key succeeds, it must never be re-enqueued.
  // Server stores a boolean per bubble; duplicate POSTs are idempotent but wasteful.
  // This set survives across enqueue calls within a session to enforce first-press-only
  // semantics even if the caller enqueues the same bubble multiple times. See plan §3.E4.
  private readonly successKeys = new Set<string>();
  private readonly listeners = new Set<() => void>();
  private flushLock = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onSuccessCallback: ((entry: BubbleQuestionPressEntry) => void) | undefined;
  // Cached snapshot — invalidated by notify() so subscribers get a stable
  // reference until entries actually change. Required for React's
  // useSyncExternalStore to avoid tearing/infinite re-render loops.
  private snapshotCache: BubbleQuestionPressEntry[] | null = null;

  constructor(private readonly poster: BubbleQuestionPoster) {}

  enqueue(args: { publishId: number; bubbleId: number }): void {
    const key = bubbleQuestionKeyOf(args.publishId, args.bubbleId);
    // First-press dedupe: skip if already in-flight OR already succeeded this session.
    if (this.entries.has(key) || this.successKeys.has(key)) return;

    const entry: BubbleQuestionPressEntry = {
      key,
      publishId: args.publishId,
      bubbleId: args.bubbleId,
      attempt: 0,
      nextAttemptAt: Date.now(),
    };
    this.entries.set(key, entry);
    this.notify();
    this.scheduleFlush(0);
  }

  /** 현재 큐 상태 스냅샷 (UI merge 소비용). */
  snapshot(): BubbleQuestionPressEntry[] {
    if (!this.snapshotCache) {
      this.snapshotCache = [...this.entries.values()];
    }
    return this.snapshotCache;
  }

  /**
   * 세션 내에서 누른 적이 있는 (in-flight + 성공한) 모든 bubbleId Set.
   * mount-time merge 용. snapshot() 은 in-flight 만 노출하므로 성공 후 재마운트 시
   * 이미 펼쳤어야 할 ? 가 닫혀 보이는 race 를 막기 위해 별도 제공한다.
   * BE-2 (bubble.id globally unique) 라 publishId 필터 없이 전체 합쳐도 false positive 없음.
   */
  pressedBubbleIds(): Set<number> {
    const ids = new Set<number>();
    for (const entry of this.entries.values()) {
      ids.add(entry.bubbleId);
    }
    for (const key of this.successKeys) {
      const idx = key.indexOf(':');
      if (idx > 0) ids.add(Number(key.slice(idx + 1)));
    }
    return ids;
  }

  /** 큐 변화 구독. 반환 함수 호출로 해제. */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  /** 성공 dequeue 시 호출될 콜백 지정. React Query invalidate 훅업 등에 사용. */
  setOnSuccess(fn: ((entry: BubbleQuestionPressEntry) => void) | undefined): void {
    this.onSuccessCallback = fn;
  }

  /** 테스트 헬퍼: 내부 timer/entries/successKeys 정리 (실서비스에서는 사용하지 않음). */
  _reset(): void {
    this.entries.clear();
    this.successKeys.clear();
    this.listeners.clear();
    this.onSuccessCallback = undefined;
    this.flushLock = false;
    this.snapshotCache = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private notify(): void {
    this.snapshotCache = null;
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
    originalEntry: BubbleQuestionPressEntry,
    outcome: BubbleQuestionFlushOutcome,
    now: number
  ): void {
    const current = this.entries.get(originalEntry.key);

    // 큐 처리 중 entry 가 사라진 경우(예: _reset) stale outcome 은 스킵한다.
    if (!current || current.attempt !== originalEntry.attempt) {
      return;
    }

    switch (outcome) {
      case 'success':
        this.entries.delete(originalEntry.key);
        // First-press semantics: mark key as permanently succeeded for this session.
        this.successKeys.add(originalEntry.key);
        this.onSuccessCallback?.(originalEntry);
        break;
      case 'drop':
        // 서버 스키마 drift 등 영구 실패로 간주. 로그만 남기고 dequeue.
        console.warn('[bubble-question-queue] drop entry', {
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
        current.nextAttemptAt = now + bubbleBackoffDelayMs(current.attempt);
        break;
    }

    this.notify();
  }
}
