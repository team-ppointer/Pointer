/**
 * explicit flush 의 핵심 분기 로직을 hook 외부 pure 함수로 추출.
 *
 * 책임:
 * - 큐 flushExplicit 호출 → outcome 분기
 * - success → return
 * - 그 외 (retry/hold/timeout) → showRetryAlert 호출 → 사용자 결정에 따라 retry 또는 discard
 *
 * hook 외부 pure 함수라 jest 로 직접 단위 테스트 가능.
 */
import type { ExplicitFlushResult } from '../services/handwritingSaveQueue';

export interface FlushPendingQueue {
  flushExplicit: (scrapId: number, data: string) => Promise<ExplicitFlushResult>;
  dequeue: (scrapId: number) => void;
}

export interface RunExplicitFlushLoopDeps {
  scrapId: number;
  dataJson: string;
  queue: FlushPendingQueue;
  /** 사용자에게 "재시도/확인" Alert 표시. 'retry' / 'discard' 반환. */
  showRetryAlert: () => Promise<'retry' | 'discard'>;
  /** discard 결정 시 호출 (예: queryClient.removeQueries 등 cache cleanup). */
  onDiscard: () => void;
}

/**
 * @returns 'success' | 'discard'
 */
export async function runExplicitFlushLoop(
  deps: RunExplicitFlushLoopDeps
): Promise<'success' | 'discard'> {
  while (true) {
    const result = await deps.queue.flushExplicit(deps.scrapId, deps.dataJson);
    if (result.outcome === 'success') {
      return 'success';
    }
    const action = await deps.showRetryAlert();
    if (action === 'retry') continue;
    deps.queue.dequeue(deps.scrapId);
    deps.onDiscard();
    return 'discard';
  }
}
