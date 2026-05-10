import {
  runExplicitFlushLoop,
  type FlushPendingQueue,
  type RunExplicitFlushLoopDeps,
} from '../handwritingFlushPending';
import type { ExplicitFlushResult } from '../../services/handwritingSaveQueue';

const SCRAP_ID = 100;
const DATA = '{"strokes":[],"texts":[]}';

const makeQueue = (
  outcomes: ExplicitFlushResult['outcome'][]
): FlushPendingQueue & {
  flushExplicit: jest.Mock;
  dequeue: jest.Mock;
} => {
  const queue = {
    flushExplicit: jest.fn(),
    dequeue: jest.fn(),
  };
  outcomes.forEach((outcome, i) => {
    queue.flushExplicit.mockResolvedValueOnce({ outcome, version: i + 1 });
  });
  return queue;
};

describe('runExplicitFlushLoop', () => {
  it('success → return "success", alert 호출 0', async () => {
    const queue = makeQueue(['success']);
    const showRetryAlert = jest.fn();
    const onDiscard = jest.fn();

    const result = await runExplicitFlushLoop({
      scrapId: SCRAP_ID,
      dataJson: DATA,
      queue,
      showRetryAlert,
      onDiscard,
    });

    expect(result).toBe('success');
    expect(queue.flushExplicit).toHaveBeenCalledTimes(1);
    expect(queue.flushExplicit).toHaveBeenCalledWith(SCRAP_ID, DATA);
    expect(showRetryAlert).not.toHaveBeenCalled();
    expect(queue.dequeue).not.toHaveBeenCalled();
    expect(onDiscard).not.toHaveBeenCalled();
  });

  it('retry → 사용자 "다시 시도" → 두번째 success → return "success"', async () => {
    const queue = makeQueue(['retry', 'success']);
    const showRetryAlert = jest.fn().mockResolvedValueOnce('retry');
    const onDiscard = jest.fn();

    const result = await runExplicitFlushLoop({
      scrapId: SCRAP_ID,
      dataJson: DATA,
      queue,
      showRetryAlert,
      onDiscard,
    });

    expect(result).toBe('success');
    expect(queue.flushExplicit).toHaveBeenCalledTimes(2);
    expect(showRetryAlert).toHaveBeenCalledTimes(1);
    expect(queue.dequeue).not.toHaveBeenCalled();
    expect(onDiscard).not.toHaveBeenCalled();
  });

  it('retry → 사용자 "확인" (discard) → dequeue + onDiscard → return "discard"', async () => {
    const queue = makeQueue(['retry']);
    const showRetryAlert = jest.fn().mockResolvedValue('discard');
    const onDiscard = jest.fn();

    const result = await runExplicitFlushLoop({
      scrapId: SCRAP_ID,
      dataJson: DATA,
      queue,
      showRetryAlert,
      onDiscard,
    });

    expect(result).toBe('discard');
    expect(queue.flushExplicit).toHaveBeenCalledTimes(1);
    expect(showRetryAlert).toHaveBeenCalledTimes(1);
    expect(queue.dequeue).toHaveBeenCalledWith(SCRAP_ID);
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('hold → 사용자 "다시 시도" → success → return "success"', async () => {
    const queue = makeQueue(['hold', 'success']);
    const showRetryAlert = jest.fn().mockResolvedValueOnce('retry');
    const onDiscard = jest.fn();

    const result = await runExplicitFlushLoop({
      scrapId: SCRAP_ID,
      dataJson: DATA,
      queue,
      showRetryAlert,
      onDiscard,
    });

    expect(result).toBe('success');
    expect(showRetryAlert).toHaveBeenCalledTimes(1);
  });

  it('timeout → 사용자 "확인" → discard', async () => {
    const queue = makeQueue(['timeout']);
    const showRetryAlert = jest.fn().mockResolvedValue('discard');
    const onDiscard = jest.fn();

    const result = await runExplicitFlushLoop({
      scrapId: SCRAP_ID,
      dataJson: DATA,
      queue,
      showRetryAlert,
      onDiscard,
    });

    expect(result).toBe('discard');
    expect(queue.dequeue).toHaveBeenCalledWith(SCRAP_ID);
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('연속 retry 3회 → 마지막 discard → dequeue + onDiscard', async () => {
    const queue = makeQueue(['retry', 'retry', 'retry']);
    const showRetryAlert = jest
      .fn()
      .mockResolvedValueOnce('retry')
      .mockResolvedValueOnce('retry')
      .mockResolvedValueOnce('discard');
    const onDiscard = jest.fn();

    const result = await runExplicitFlushLoop({
      scrapId: SCRAP_ID,
      dataJson: DATA,
      queue,
      showRetryAlert,
      onDiscard,
    });

    expect(result).toBe('discard');
    expect(queue.flushExplicit).toHaveBeenCalledTimes(3);
    expect(showRetryAlert).toHaveBeenCalledTimes(3);
    expect(queue.dequeue).toHaveBeenCalledTimes(1);
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('discard 시 dequeue 가 onDiscard 보다 먼저 호출됨 (순서 보장)', async () => {
    const queue = makeQueue(['retry']);
    const calls: string[] = [];
    queue.dequeue.mockImplementation(() => calls.push('dequeue'));
    const showRetryAlert = jest.fn().mockResolvedValue('discard');
    const onDiscard = jest.fn().mockImplementation(() => calls.push('onDiscard'));

    await runExplicitFlushLoop({
      scrapId: SCRAP_ID,
      dataJson: DATA,
      queue,
      showRetryAlert,
      onDiscard,
    } satisfies RunExplicitFlushLoopDeps);

    expect(calls).toEqual(['dequeue', 'onDiscard']);
  });
});
