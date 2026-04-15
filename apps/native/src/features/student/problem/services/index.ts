import { PointingFeedbackQueue } from './pointingFeedbackQueue';
import { postPointingFeedback } from './pointingFeedbackClient';

export {
  PointingFeedbackQueue,
  backoffDelayMs,
  keyOf,
  type FlushOutcome,
  type PointingQueueEntry,
  type PointingStep,
  type QueuePoster,
} from './pointingFeedbackQueue';
export { postPointingFeedback } from './pointingFeedbackClient';

/** 앱 전역 singleton. 실제 서버 호출 poster 와 바인딩. */
export const pointingFeedbackQueue = new PointingFeedbackQueue(postPointingFeedback);
