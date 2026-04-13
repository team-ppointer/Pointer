import {
  backoffDelayMs,
  keyOf,
  PointingFeedbackQueue,
  type FlushOutcome,
  type PointingQueueEntry,
  type QueuePoster,
} from '../pointingFeedbackQueue';

// ── Helpers ─────────────────────────────────────────────────────────

const makePoster = (outcome: FlushOutcome): jest.MockedFunction<QueuePoster> =>
  jest.fn<Promise<FlushOutcome>, [PointingQueueEntry]>().mockResolvedValue(outcome);

const basePayload = {
  publishId: 100,
  pointingId: 10,
  step: 'question' as const,
  value: true,
};

// ── Pure helpers ────────────────────────────────────────────────────

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
    expect(backoffDelayMs(10)).toBe(30_000);
    expect(backoffDelayMs(100)).toBe(30_000);
  });
});

describe('keyOf', () => {
  it('formats as `${publishId}:${pointingId}:${step}`', () => {
    expect(keyOf(1, 2, 'question')).toBe('1:2:question');
    expect(keyOf(99, 42, 'confirm')).toBe('99:42:confirm');
  });
});

// ── Queue behaviour ─────────────────────────────────────────────────

describe('PointingFeedbackQueue', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    jest.useRealTimers();
  });

  it('enqueue + immediate flush on success → dequeues and invokes onSuccess', async () => {
    const poster = makePoster('success');
    const q = new PointingFeedbackQueue(poster);
    const onSuccess = jest.fn();
    q.setOnSuccess(onSuccess);

    q.enqueue(basePayload);

    expect(q.snapshot()).toHaveLength(1);
    expect(q.snapshot()[0]).toMatchObject({
      key: '100:10:question',
      publishId: 100,
      pointingId: 10,
      step: 'question',
      value: true,
      attempt: 0,
    });

    await jest.advanceTimersByTimeAsync(0);

    expect(poster).toHaveBeenCalledTimes(1);
    expect(q.snapshot()).toHaveLength(0);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ publishId: 100, pointingId: 10, step: 'question' })
    );
  });

  it('drop (non-401/403 4xx) → dequeues with warning, no onSuccess', async () => {
    const poster = makePoster('drop');
    const q = new PointingFeedbackQueue(poster);
    const onSuccess = jest.fn();
    q.setOnSuccess(onSuccess);

    q.enqueue(basePayload);
    await jest.advanceTimersByTimeAsync(0);

    expect(q.snapshot()).toHaveLength(0);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('hold (401/403) → retains entry, no attempt increment, retries after 10s', async () => {
    const poster = makePoster('hold');
    const q = new PointingFeedbackQueue(poster);

    q.enqueue(basePayload);
    await jest.advanceTimersByTimeAsync(0);

    // Held, attempt still 0, next attempt ~10s away
    expect(q.snapshot()).toHaveLength(1);
    expect(q.snapshot()[0].attempt).toBe(0);
    expect(poster).toHaveBeenCalledTimes(1);

    // Not yet retried
    await jest.advanceTimersByTimeAsync(9_999);
    expect(poster).toHaveBeenCalledTimes(1);

    // Retry at 10s
    await jest.advanceTimersByTimeAsync(1);
    expect(poster).toHaveBeenCalledTimes(2);
    expect(q.snapshot()[0].attempt).toBe(0); // hold never increments attempt
  });

  it('retry (5xx/network) → increments attempt with exponential backoff schedule', async () => {
    const poster = makePoster('retry');
    const q = new PointingFeedbackQueue(poster);

    q.enqueue(basePayload);

    // Initial flush
    await jest.advanceTimersByTimeAsync(0);
    expect(poster).toHaveBeenCalledTimes(1);
    expect(q.snapshot()[0].attempt).toBe(1);

    // +1s: second attempt
    await jest.advanceTimersByTimeAsync(1000);
    expect(poster).toHaveBeenCalledTimes(2);
    expect(q.snapshot()[0].attempt).toBe(2);

    // +2s: third attempt
    await jest.advanceTimersByTimeAsync(2000);
    expect(poster).toHaveBeenCalledTimes(3);

    // +4s: fourth
    await jest.advanceTimersByTimeAsync(4000);
    expect(poster).toHaveBeenCalledTimes(4);

    // +8s, +16s, +30s (cap)
    await jest.advanceTimersByTimeAsync(8000);
    expect(poster).toHaveBeenCalledTimes(5);

    await jest.advanceTimersByTimeAsync(16_000);
    expect(poster).toHaveBeenCalledTimes(6);

    await jest.advanceTimersByTimeAsync(30_000);
    expect(poster).toHaveBeenCalledTimes(7);

    // After cap: still 30s intervals
    await jest.advanceTimersByTimeAsync(30_000);
    expect(poster).toHaveBeenCalledTimes(8);
  });

  it('dedup by key: same (publishId, pointingId, step) overwrites value and resets attempt', async () => {
    const poster = makePoster('retry');
    const q = new PointingFeedbackQueue(poster);

    q.enqueue(basePayload); // value: true
    await jest.advanceTimersByTimeAsync(0);
    expect(q.snapshot()).toHaveLength(1);
    expect(q.snapshot()[0].attempt).toBe(1);

    // Overwrite with value: false. Attempt should reset to 0 and
    // scheduled flush should trigger immediately.
    q.enqueue({ ...basePayload, value: false });
    expect(q.snapshot()).toHaveLength(1);
    expect(q.snapshot()[0].value).toBe(false);
    expect(q.snapshot()[0].attempt).toBe(0);

    await jest.advanceTimersByTimeAsync(0);
    expect(poster).toHaveBeenCalledTimes(2);
    const mostRecentCall = poster.mock.calls[1][0];
    expect(mostRecentCall.value).toBe(false);
  });

  it('different (publishId, pointingId, step) triples coexist as separate entries', async () => {
    const poster = makePoster('success');
    const q = new PointingFeedbackQueue(poster);

    q.enqueue({ publishId: 1, pointingId: 10, step: 'question', value: true });
    q.enqueue({ publishId: 1, pointingId: 10, step: 'confirm', value: false });
    q.enqueue({ publishId: 2, pointingId: 10, step: 'question', value: true });

    expect(q.snapshot()).toHaveLength(3);

    await jest.advanceTimersByTimeAsync(0);
    expect(poster).toHaveBeenCalledTimes(3);
    expect(q.snapshot()).toHaveLength(0);
  });

  it('subscribe + notify: listeners fire on state change', async () => {
    const poster = makePoster('success');
    const q = new PointingFeedbackQueue(poster);
    const listener = jest.fn();
    const unsubscribe = q.subscribe(listener);

    q.enqueue(basePayload);
    expect(listener).toHaveBeenCalledTimes(1); // on enqueue

    await jest.advanceTimersByTimeAsync(0);
    expect(listener).toHaveBeenCalledTimes(2); // on success dequeue

    unsubscribe();
    q.enqueue({ ...basePayload, step: 'confirm' });
    expect(listener).toHaveBeenCalledTimes(2); // no further calls after unsubscribe
  });

  it('onSuccess only fires for success outcome (not retry/hold/drop)', async () => {
    const onSuccess = jest.fn();
    const outcomes: FlushOutcome[] = ['drop', 'hold', 'retry'];

    for (const outcome of outcomes) {
      const poster = makePoster(outcome);
      const q = new PointingFeedbackQueue(poster);
      q.setOnSuccess(onSuccess);

      q.enqueue({ ...basePayload, pointingId: outcomes.indexOf(outcome) + 1 });
      await jest.advanceTimersByTimeAsync(0);
    }

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('stale outcome on overwrite during flight is skipped (V1 outcome does not mutate V2)', async () => {
    // Poster that resolves only when manually triggered. Both in-flight and
    // subsequent calls share the same resolved promise.
    let resolvePoster!: (v: FlushOutcome) => void;
    const posterPromise = new Promise<FlushOutcome>((resolve) => {
      resolvePoster = resolve;
    });
    const poster = jest.fn<Promise<FlushOutcome>, [PointingQueueEntry]>(() => posterPromise);
    const q = new PointingFeedbackQueue(poster);
    const listener = jest.fn();
    q.subscribe(listener);

    q.enqueue(basePayload); // V1: value=true, attempt=0 → notify #1
    jest.advanceTimersByTime(0); // timer fires, V1 poster pending
    expect(poster).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);

    // Overwrite with V2 (value=false) while V1 poster is in-flight. → notify #2
    q.enqueue({ ...basePayload, value: false });
    expect(q.snapshot()[0].value).toBe(false);
    expect(q.snapshot()[0].attempt).toBe(0);
    expect(listener).toHaveBeenCalledTimes(2);

    // Resolve the in-flight promise with 'retry'.
    // - V1's outcome: SKIPPED (current entry value=false differs from V1's value=true)
    //   Critically, the stale path must NOT call notify — entries map is unchanged so
    //   triggering a snapshot rerender would be wasted work.
    // - After V1's flush finishes, scheduleNext picks up V2 and runs a fresh flush.
    //   V2 poster call also resolves to 'retry' (shared promise), applied freshly → notify #3.
    resolvePoster('retry');
    await jest.advanceTimersByTimeAsync(0);

    // Two poster invocations: V1 (stale) + V2 (fresh).
    expect(poster).toHaveBeenCalledTimes(2);
    // attempt=1 from V2's fresh retry only, NOT 2 (which would mean V1's outcome leaked).
    expect(q.snapshot()[0].attempt).toBe(1);
    expect(q.snapshot()[0].value).toBe(false);
    // Exactly 3 notifications total: 2 enqueues + 1 fresh retry. The stale outcome
    // is silent — guards against unnecessary rerenders in useSyncExternalStore consumers.
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
