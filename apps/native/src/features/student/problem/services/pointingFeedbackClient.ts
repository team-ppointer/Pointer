/**
 * `pointingFeedbackQueue` 가 사용할 real-world poster.
 * 단일 entry 를 서버에 POST 하고 HTTP 응답을 `FlushOutcome` 로 분류한다.
 *
 * 분류 기준 (apps/native/src/features/student/analytics/client.ts 패턴 미러):
 * - 2xx → success
 * - 401 / 403 → hold (auth 만료 가능성, drop 하지 않고 대기 후 재시도)
 * - 그 외 4xx → drop (invalid payload / 서버 스키마 drift 간주)
 * - 5xx → retry
 * - fetch throw (network) → retry
 */
import postPointing from '@apis/controller/student/study/postPointing';

import type { FlushOutcome, PointingQueueEntry } from './pointingFeedbackQueue';

export async function postPointingFeedback(entry: PointingQueueEntry): Promise<FlushOutcome> {
  try {
    const res = await postPointing({
      publishId: entry.publishId,
      pointingId: entry.pointingId,
      ...(entry.step === 'question'
        ? { isQuestionUnderstood: entry.value }
        : { isCommentUnderstood: entry.value }),
    });
    if (res.response.ok) return 'success';
    const status = res.response.status;
    if (status === 401 || status === 403) return 'hold';
    if (status >= 400 && status < 500) return 'drop';
    return 'retry';
  } catch {
    return 'retry';
  }
}
