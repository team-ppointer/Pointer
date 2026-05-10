/**
 * `handwritingSaveQueue` 가 사용할 real-world poster.
 * 단일 entry 를 서버에 PUT 하고 HTTP 응답을 `FlushOutcome` 로 분류한다.
 *
 * 분류 기준:
 * - 2xx → success
 * - 401 / 403 → hold (auth 만료 가능성, 대기 후 재시도)
 * - 그 외 (4xx / 5xx / fetch throw) → retry
 *   (4xx 도 일시적 가능성 — 서버 schema drift / 422 일시 validation / 429 등.
 *    영영 retry 만 옳지 않은 영구 4xx 케이스는 화면 안에서 사용자가 명시 discard 로 종료)
 *
 * dev only: `globalThis.setHwTestMode(...)` 로 응답 시뮬레이션 가능 (production 영향 0).
 */
import { client } from '@apis';

import type { FlushOutcome, HandwritingQueueEntry } from './handwritingSaveQueue';
import { applyHwTestMode } from './__dev__/handwritingTestMode';

export async function postHandwritingSave(entry: HandwritingQueueEntry): Promise<FlushOutcome> {
  try {
    if (__DEV__) {
      const mocked = await applyHwTestMode();
      if (mocked !== null) return mocked;
    }
    const res = await client.PUT('/api/student/scrap/{scrapId}/handwriting', {
      params: { path: { scrapId: entry.scrapId } },
      body: { dataJson: entry.data },
    });
    if (res.response.ok) return 'success';
    const status = res.response.status;
    if (status === 401 || status === 403) return 'hold';
    return 'retry';
  } catch {
    return 'retry';
  }
}
