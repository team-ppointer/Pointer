import { PointingFeedbackQueue } from './pointingFeedbackQueue';
import { postPointingFeedback } from './pointingFeedbackClient';
import { BubbleQuestionPressQueue } from './bubbleQuestionPressQueue';
import { postBubbleQuestionPress } from './bubbleQuestionPressClient';

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

export {
  BubbleQuestionPressQueue,
  bubbleBackoffDelayMs,
  bubbleQuestionKeyOf,
  type BubbleQuestionFlushOutcome,
  type BubbleQuestionPressEntry,
  type BubbleQuestionPoster,
} from './bubbleQuestionPressQueue';
export { postBubbleQuestionPress } from './bubbleQuestionPressClient';
export { BubbleQuestionPressQueueWiring } from './BubbleQuestionPressQueueWiring';

/** 앱 전역 singleton. 실제 서버 호출 poster 와 바인딩. */
export const pointingFeedbackQueue = new PointingFeedbackQueue(postPointingFeedback);

/** 앱 전역 singleton. 실제 서버 호출 poster 와 바인딩. */
export const bubbleQuestionPressQueue = new BubbleQuestionPressQueue(postBubbleQuestionPress);
