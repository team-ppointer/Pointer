import {
  backoffDelayMs,
  HandwritingSaveQueue,
  type FlushOutcome,
  type HandwritingQueueEntry,
  type QueuePoster,
} from '../handwritingSaveQueue';

const SCRAP_ID = 100;
const DATA = '{"strokes":[],"texts":[]}';

const makePoster = (outcome: FlushOutcome): jest.MockedFunction<QueuePoster> =>
  jest.fn<Promise<FlushOutcome>, [HandwritingQueueEntry]>().mockResolvedValue(outcome);

describe('backoffDelayMs', () => {
  it('returns 0 for attempt <= 0', () => {
    expect(backoffDelayMs(0)).toBe(0);
    expect(backoffDelayMs(-1)).toBe(0);
  });

  it('follows exponential backoff: [1s, 2s, 4s, 8s, 16s, 30s cap]', () => {
    expect(backoffDelayMs(1)).toBe(1000);
    expect(backoffDelayMs(2)).toBe(2000);
    expect(backoffDelayMs(3)).toBe(4000);
    expect(backoffDelayMs(4)).toBe(8000);
    expect(backoffDelayMs(5)).toBe(16_000);
    expect(backoffDelayMs(6)).toBe(30_000);
    expect(backoffDelayMs(100)).toBe(30_000);
  });
});

describe('HandwritingSaveQueue — enqueueAutosave', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('success → dequeue + onSaved fire', async () => {
    const poster = makePoster('success');
    const q = new HandwritingSaveQueue(poster);
    const onSaved = jest.fn();
    q.setCallbacks({ onSaved });

    q.enqueueAutosave(SCRAP_ID, DATA, 'autosave');
    expect(q.snapshot()).toHaveLength(1);
    expect(q.snapshot()[0]).toMatchObject({
      scrapId: SCRAP_ID,
      data: DATA,
      source: 'autosave',
      version: 1,
    });

    await jest.advanceTimersByTimeAsync(0);

    expect(poster).toHaveBeenCalledTimes(1);
    expect(q.snapshot()).toHaveLength(0);
    expect(onSaved).toHaveBeenCalledWith({ scrapId: SCRAP_ID, data: DATA, version: 1 });
  });

  it('hold (401/403) → retain + retry after 10s + onAutosaveFailed("hold")', async () => {
    const poster = makePoster('hold');
    const q = new HandwritingSaveQueue(poster);
    const onAutosaveFailed = jest.fn();
    q.setCallbacks({ onAutosaveFailed });

    q.enqueueAutosave(SCRAP_ID, DATA, 'autosave');
    await jest.advanceTimersByTimeAsync(0);

    expect(q.snapshot()).toHaveLength(1);
    expect(q.snapshot()[0].attempt).toBe(0);
    expect(poster).toHaveBeenCalledTimes(1);
    expect(onAutosaveFailed).toHaveBeenCalledWith({
      scrapId: SCRAP_ID,
      outcome: 'hold',
      version: 1,
    });

    await jest.advanceTimersByTimeAsync(9_999);
    expect(poster).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    expect(poster).toHaveBeenCalledTimes(2);
  });

  it('retry (5xx/network) → exponential backoff + onAutosaveFailed("retry")', async () => {
    const poster = makePoster('retry');
    const q = new HandwritingSaveQueue(poster);
    const onAutosaveFailed = jest.fn();
    q.setCallbacks({ onAutosaveFailed });

    q.enqueueAutosave(SCRAP_ID, DATA, 'autosave');

    await jest.advanceTimersByTimeAsync(0);
    expect(poster).toHaveBeenCalledTimes(1);
    expect(q.snapshot()[0].attempt).toBe(1);
    expect(onAutosaveFailed).toHaveBeenLastCalledWith({
      scrapId: SCRAP_ID,
      outcome: 'retry',
      version: 1,
    });

    await jest.advanceTimersByTimeAsync(1000);
    expect(poster).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(2000);
    expect(poster).toHaveBeenCalledTimes(3);
    await jest.advanceTimersByTimeAsync(4000);
    expect(poster).toHaveBeenCalledTimes(4);
  });

  it('dedup by scrapId: data overwrite, attempt reset, version 증가', async () => {
    const poster = makePoster('retry');
    const q = new HandwritingSaveQueue(poster);

    q.enqueueAutosave(SCRAP_ID, DATA, 'autosave');
    await jest.advanceTimersByTimeAsync(0);
    expect(q.snapshot()[0].version).toBe(1);
    expect(q.snapshot()[0].attempt).toBe(1);

    const newData = '{"strokes":[{"id":"a"}],"texts":[]}';
    q.enqueueAutosave(SCRAP_ID, newData, 'autosave');
    expect(q.snapshot()[0].data).toBe(newData);
    expect(q.snapshot()[0].attempt).toBe(0);
    expect(q.snapshot()[0].version).toBe(2);

    await jest.advanceTimersByTimeAsync(0);
    expect(poster).toHaveBeenCalledTimes(2);
    expect(poster.mock.calls[1][0].data).toBe(newData);
  });

  it('multi-scrapId entries coexist', async () => {
    const poster = makePoster('success');
    const q = new HandwritingSaveQueue(poster);

    q.enqueueAutosave(1, DATA, 'autosave');
    q.enqueueAutosave(2, DATA, 'autosave');
    q.enqueueAutosave(3, DATA, 'background');
    expect(q.snapshot()).toHaveLength(3);

    await jest.advanceTimersByTimeAsync(0);
    expect(poster).toHaveBeenCalledTimes(3);
    expect(q.snapshot()).toHaveLength(0);
  });

  it('onAutosaveFailed only fires for autosave/background (not explicit)', async () => {
    const poster = makePoster('retry');
    const q = new HandwritingSaveQueue(poster);
    const onAutosaveFailed = jest.fn();
    q.setCallbacks({ onAutosaveFailed });

    void q.flushExplicit(SCRAP_ID, DATA);
    await jest.advanceTimersByTimeAsync(0);

    expect(onAutosaveFailed).not.toHaveBeenCalled();
  });
});

describe('HandwritingSaveQueue — flushExplicit (1회 시도 spec)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('success → resolve("success") + dequeue + onSaved', async () => {
    const poster = makePoster('success');
    const q = new HandwritingSaveQueue(poster);
    const onSaved = jest.fn();
    q.setCallbacks({ onSaved });

    const promise = q.flushExplicit(SCRAP_ID, DATA);
    await jest.advanceTimersByTimeAsync(0);
    const result = await promise;

    expect(result).toEqual({ outcome: 'success', version: 1 });
    expect(q.has(SCRAP_ID)).toBe(false);
    expect(onSaved).toHaveBeenCalledWith({ scrapId: SCRAP_ID, data: DATA, version: 1 });
  });

  it('retry → resolve("retry") + dequeue (autosave 와 달리 backoff 안 함)', async () => {
    const poster = makePoster('retry');
    const q = new HandwritingSaveQueue(poster);

    const promise = q.flushExplicit(SCRAP_ID, DATA);
    await jest.advanceTimersByTimeAsync(0);
    const result = await promise;

    expect(result).toEqual({ outcome: 'retry', version: 1 });
    expect(q.has(SCRAP_ID)).toBe(false);
    expect(poster).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(60_000);
    expect(poster).toHaveBeenCalledTimes(1); // 1회 시도 spec — 추가 retry 안 함
  });

  it('hold → resolve("hold") + dequeue', async () => {
    const poster = makePoster('hold');
    const q = new HandwritingSaveQueue(poster);

    const promise = q.flushExplicit(SCRAP_ID, DATA);
    await jest.advanceTimersByTimeAsync(0);
    const result = await promise;

    expect(result).toEqual({ outcome: 'hold', version: 1 });
    expect(q.has(SCRAP_ID)).toBe(false);
  });

  it('5s timeout → resolve("timeout") + dequeue', async () => {
    let resolvePoster!: (v: FlushOutcome) => void;
    const poster = jest.fn<Promise<FlushOutcome>, [HandwritingQueueEntry]>().mockImplementation(
      () =>
        new Promise<FlushOutcome>((resolve) => {
          resolvePoster = resolve;
        })
    );
    const q = new HandwritingSaveQueue(poster);

    const promise = q.flushExplicit(SCRAP_ID, DATA);
    await jest.advanceTimersByTimeAsync(0);
    expect(poster).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(5_000);
    const result = await promise;

    expect(result).toEqual({ outcome: 'timeout', version: 1 });
    expect(q.has(SCRAP_ID)).toBe(false);

    // 후행 응답 도착해도 stale 처리
    resolvePoster('success');
    await jest.advanceTimersByTimeAsync(0);
  });

  it('explicit waiter 살아있는 동안 enqueueAutosave skip', async () => {
    let resolvePoster!: (v: FlushOutcome) => void;
    const poster = jest.fn<Promise<FlushOutcome>, [HandwritingQueueEntry]>().mockImplementation(
      () =>
        new Promise<FlushOutcome>((resolve) => {
          resolvePoster = resolve;
        })
    );
    const q = new HandwritingSaveQueue(poster);

    const promise = q.flushExplicit(SCRAP_ID, DATA);
    await jest.advanceTimersByTimeAsync(0);

    // explicit inflight 중 autosave enqueue → skip
    q.enqueueAutosave(SCRAP_ID, '{"different":1}', 'autosave');
    expect(q.snapshot()[0].source).toBe('explicit');
    expect(q.snapshot()[0].data).toBe(DATA);
    expect(q.snapshot()[0].version).toBe(1);

    resolvePoster('success');
    await jest.advanceTimersByTimeAsync(0);
    await promise;
  });
});

describe('HandwritingSaveQueue — version stale guard', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('inflight V1 응답 도착 시점에 V2 가 enqueue 됐으면 V1 outcome stale skip', async () => {
    let resolvePoster!: (v: FlushOutcome) => void;
    const poster = jest.fn<Promise<FlushOutcome>, [HandwritingQueueEntry]>().mockImplementation(
      () =>
        new Promise<FlushOutcome>((resolve) => {
          resolvePoster = resolve;
        })
    );
    const q = new HandwritingSaveQueue(poster);
    const onAutosaveFailed = jest.fn();
    q.setCallbacks({ onAutosaveFailed });

    q.enqueueAutosave(SCRAP_ID, DATA, 'autosave'); // V1
    await jest.advanceTimersByTimeAsync(0);
    expect(poster).toHaveBeenCalledTimes(1);
    expect(q.snapshot()[0].version).toBe(1);

    // V1 inflight 중 V2 enqueue (dedup overwrite)
    const newData = '{"strokes":[{"id":"v2"}],"texts":[]}';
    q.enqueueAutosave(SCRAP_ID, newData, 'autosave'); // V2
    expect(q.snapshot()[0].version).toBe(2);
    expect(q.snapshot()[0].data).toBe(newData);
    expect(q.snapshot()[0].attempt).toBe(0);

    // V1 응답 도착 (retry) → version stale → entries 갱신/onAutosaveFailed skip
    resolvePoster('retry');
    await jest.advanceTimersByTimeAsync(0);

    expect(q.snapshot()[0].version).toBe(2); // V2 그대로
    expect(q.snapshot()[0].attempt).toBe(0); // V1 retry 가 attempt 못 올림
    // onAutosaveFailed 는 V2 의 응답 처리 시점에 fire — 본 케이스에서 V2 도 retry 응답
    expect(poster).toHaveBeenCalledTimes(2);
  });

  it('cleanup dequeue 후 inflight success 응답 → onSaved 는 fire (stale guard 우회)', async () => {
    let resolvePoster!: (v: FlushOutcome) => void;
    const poster = jest.fn<Promise<FlushOutcome>, [HandwritingQueueEntry]>().mockImplementation(
      () =>
        new Promise<FlushOutcome>((resolve) => {
          resolvePoster = resolve;
        })
    );
    const q = new HandwritingSaveQueue(poster);
    const onSaved = jest.fn();
    q.setCallbacks({ onSaved });

    q.enqueueAutosave(SCRAP_ID, DATA, 'autosave');
    await jest.advanceTimersByTimeAsync(0);

    // unmount cleanup 시뮬레이션
    q.dequeue(SCRAP_ID);
    expect(q.has(SCRAP_ID)).toBe(false);

    // inflight 응답 success 도착
    resolvePoster('success');
    await jest.advanceTimersByTimeAsync(0);

    // onSaved 는 fire 되어야 — cache 갱신 보장
    expect(onSaved).toHaveBeenCalledWith({ scrapId: SCRAP_ID, data: DATA, version: 1 });
  });
});

describe('HandwritingSaveQueue — utility', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('has() reflects current entries', async () => {
    const poster = makePoster('success');
    const q = new HandwritingSaveQueue(poster);

    expect(q.has(SCRAP_ID)).toBe(false);
    q.enqueueAutosave(SCRAP_ID, DATA, 'autosave');
    expect(q.has(SCRAP_ID)).toBe(true);

    await jest.advanceTimersByTimeAsync(0);
    expect(q.has(SCRAP_ID)).toBe(false);
  });

  it('dequeue removes entry from Map (inflight 자체는 abort 안 함)', async () => {
    const poster = makePoster('success');
    const q = new HandwritingSaveQueue(poster);

    q.enqueueAutosave(SCRAP_ID, DATA, 'autosave');
    expect(q.has(SCRAP_ID)).toBe(true);

    q.dequeue(SCRAP_ID);
    expect(q.has(SCRAP_ID)).toBe(false);
  });

  it('_reset clears all internal state', async () => {
    const poster = makePoster('success');
    const q = new HandwritingSaveQueue(poster);
    const onSaved = jest.fn();
    q.setCallbacks({ onSaved });

    q.enqueueAutosave(SCRAP_ID, DATA, 'autosave');
    expect(q.snapshot()).toHaveLength(1);

    q._reset();
    expect(q.snapshot()).toHaveLength(0);

    onSaved.mockClear();
    q.enqueueAutosave(SCRAP_ID, DATA, 'autosave');
    await jest.advanceTimersByTimeAsync(0);
    expect(onSaved).not.toHaveBeenCalled(); // _reset 으로 콜백 해제
  });
});
