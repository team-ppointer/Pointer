import { HandwritingSaveQueue } from './handwritingSaveQueue';
import { postHandwritingSave } from './handwritingSavePoster';

export {
  HandwritingSaveQueue,
  backoffDelayMs,
  type FlushOutcome,
  type HandwritingQueueEntry,
  type QueuePoster,
  type SaveSource,
  type ExplicitFlushResult,
  type QueueCallbacks,
} from './handwritingSaveQueue';
export { postHandwritingSave } from './handwritingSavePoster';
export { HandwritingSaveQueueWiring } from './HandwritingSaveQueueWiring';

/** 앱 전역 singleton. 실제 서버 호출 poster 와 바인딩. */
export const handwritingSaveQueue = new HandwritingSaveQueue(postHandwritingSave);
