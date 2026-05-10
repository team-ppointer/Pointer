/**
 * 필기 저장 큐 — version 기반 race 봉쇄 + 화면 안에서만 retry.
 *
 * 책임:
 * - autosave / AppState background — backoff retry, 사용자 인지 콜백
 * - explicit flush (사용자 onBack/탭/swipe) — 1회 시도, 결과 반환
 * - 단일 inflight 직렬화 (flushLock)
 * - scrapId 별 version 단조 증가, version stale guard
 *
 * 정합성 가정: 화면 unmount 시 매니저가 dequeue 호출 → 화면 떠난 후 retry 안 함.
 * inflight PUT 자체는 abort 못 하므로 응답 도착 시 version stale guard 로 skip.
 */

export type SaveSource = 'autosave' | 'background' | 'explicit';
export type FlushOutcome = 'success' | 'hold' | 'retry';

export interface HandwritingQueueEntry {
  scrapId: number;
  data: string;
  version: number;
  attempt: number;
  nextAttemptAt: number;
  source: SaveSource;
}

export interface ExplicitFlushResult {
  outcome: FlushOutcome | 'timeout';
  version: number;
}

export interface QueueCallbacks {
  onSaved?: (e: { scrapId: number; data: string; version: number }) => void;
  onAutosaveFailed?: (e: { scrapId: number; outcome: 'hold' | 'retry'; version: number }) => void;
}

export type QueuePoster = (entry: HandwritingQueueEntry) => Promise<FlushOutcome>;

const FLUSH_TIMEOUT_MS = 5_000;
const HOLD_DELAY_MS = 10_000;

export function backoffDelayMs(attempt: number): number {
  if (attempt <= 0) return 0;
  return Math.min(1000 * 2 ** (attempt - 1), 30_000);
}

export class HandwritingSaveQueue {
  private readonly entries = new Map<number, HandwritingQueueEntry>();
  private readonly waiters = new Map<number, (result: ExplicitFlushResult) => void>();
  // 큐 lifetime 동안 globally unique. scrapId 별 분리 시 동일 version 충돌 → waiter mis-resolve 가능.
  private versionCounter = 0;
  private callbacks: QueueCallbacks = {};
  private flushLock = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly poster: QueuePoster) {}

  setCallbacks(cb: QueueCallbacks): void {
    this.callbacks = cb;
  }

  /**
   * autosave / AppState background 경로.
   * explicit waiter 가 살아있는 동안엔 skip — explicit 의 source/version 보존.
   */
  enqueueAutosave(scrapId: number, data: string, source: 'autosave' | 'background'): void {
    const existing = this.entries.get(scrapId);
    if (existing?.source === 'explicit' && this.waiters.has(existing.version)) {
      return;
    }
    const version = this.nextVersion();
    this.entries.set(scrapId, {
      scrapId,
      data,
      version,
      attempt: 0,
      nextAttemptAt: Date.now(),
      source,
    });
    this.scheduleFlush(0);
  }

  /**
   * explicit flush — 1회 시도 후 결과 반환. 매니저가 outcome 보고 Alert 결정.
   * 5s timeout. retry/hold 모두 즉시 dequeue + waiter 통보 (autosave 와 달리 backoff 안 함).
   */
  flushExplicit(scrapId: number, data: string): Promise<ExplicitFlushResult> {
    const version = this.nextVersion();
    this.entries.set(scrapId, {
      scrapId,
      data,
      version,
      attempt: 0,
      nextAttemptAt: Date.now(),
      source: 'explicit',
    });
    return new Promise<ExplicitFlushResult>((resolve) => {
      const timer = setTimeout(() => {
        if (!this.waiters.has(version)) return;
        this.waiters.delete(version);
        const cur = this.entries.get(scrapId);
        if (cur && cur.version === version) this.entries.delete(scrapId);
        resolve({ outcome: 'timeout', version });
      }, FLUSH_TIMEOUT_MS);
      this.waiters.set(version, (result) => {
        clearTimeout(timer);
        resolve(result);
      });
      this.scheduleFlush(0);
    });
  }

  /**
   * scrapId 의 entry 제거 (entries Map 만; inflight PUT 자체는 abort 안 됨).
   * inflight 응답 도착 시 version stale guard 로 갱신 skip.
   */
  dequeue(scrapId: number): void {
    this.entries.delete(scrapId);
  }

  has(scrapId: number): boolean {
    return this.entries.has(scrapId);
  }

  snapshot(): HandwritingQueueEntry[] {
    return [...this.entries.values()];
  }

  /** 테스트 헬퍼. 실서비스 미사용. */
  _reset(): void {
    this.entries.clear();
    this.waiters.clear();
    this.versionCounter = 0;
    this.callbacks = {};
    this.flushLock = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private nextVersion(): number {
    return ++this.versionCounter;
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
    this.scheduleFlush(Math.max(0, nextAt - Date.now()));
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

  private applyOutcome(entry: HandwritingQueueEntry, outcome: FlushOutcome, now: number): void {
    // success — version 단일 식별로 stale guard 우회. cleanup dequeue 후도 onSaved fire.
    if (outcome === 'success') {
      const cur = this.entries.get(entry.scrapId);
      if (cur && cur.version === entry.version) this.entries.delete(entry.scrapId);
      this.callbacks.onSaved?.({
        scrapId: entry.scrapId,
        data: entry.data,
        version: entry.version,
      });
      this.resolveWaiter(entry.version, { outcome: 'success', version: entry.version });
      return;
    }

    // version stale (새 enqueue 들어왔거나 dequeue 됨) → entries 갱신 skip, waiter 만 통보
    const current = this.entries.get(entry.scrapId);
    if (!current || current.version !== entry.version) {
      this.resolveWaiter(entry.version, { outcome, version: entry.version });
      return;
    }

    // explicit — 1회 시도. 모든 outcome 즉시 dequeue + waiter 통보
    if (entry.source === 'explicit') {
      this.entries.delete(entry.scrapId);
      this.resolveWaiter(entry.version, { outcome, version: entry.version });
      return;
    }

    // autosave / background — backoff/hold 누적 + 인지 콜백
    if (outcome === 'hold') {
      current.nextAttemptAt = now + HOLD_DELAY_MS;
    } else {
      current.attempt += 1;
      current.nextAttemptAt = now + backoffDelayMs(current.attempt);
    }
    this.callbacks.onAutosaveFailed?.({
      scrapId: entry.scrapId,
      outcome,
      version: entry.version,
    });
  }

  private resolveWaiter(version: number, result: ExplicitFlushResult): void {
    const waiter = this.waiters.get(version);
    if (!waiter) return;
    this.waiters.delete(version);
    waiter(result);
  }
}
