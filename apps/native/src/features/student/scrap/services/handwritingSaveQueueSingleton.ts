/**
 * 앱 전역 handwritingSaveQueue singleton.
 *
 * `services/index.ts` 에서 함께 만들면 `HandwritingSaveQueueWiring` → `./index` →
 * `HandwritingSaveQueueWiring` 순환 의존성이 생긴다. 별도 파일로 분리해
 * Wiring / 매니저가 동일 singleton 을 cycle 없이 import 한다.
 */
import { HandwritingSaveQueue } from './handwritingSaveQueue';
import { postHandwritingSave } from './handwritingSavePoster';

export const handwritingSaveQueue = new HandwritingSaveQueue(postHandwritingSave);
