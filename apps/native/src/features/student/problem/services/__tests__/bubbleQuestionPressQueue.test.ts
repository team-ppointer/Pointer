import {
  bubbleBackoffDelayMs,
  bubbleQuestionKeyOf,
  BubbleQuestionPressQueue,
  type BubbleQuestionFlushOutcome,
  type BubbleQuestionPressEntry,
  type BubbleQuestionPoster,
} from '../bubbleQuestionPressQueue';

// ── Helpers ─────────────────────────────────────────────────────────

const makePoster = (
  outcome: BubbleQuestionFlushOutcome
): jest.MockedFunction<BubbleQuestionPoster> =>
  jest
    .fn<Promise<BubbleQuestionFlushOutcome>, [BubbleQuestionPressEntry]>()
    .mockResolvedValue(outcome);

const basePayload = {
  publishId: 1,
  bubbleId: 100,
};

// ── Pure helpers ────────────────────────────────────────────────────

describe('bubbleBackoffDelayMs', () => {
  it('returns 0 for attempt <= 0', () => {
    expect(bubbleBackoffDelayMs(0)).toBe(0);
    expect(bubbleBackoffDelayMs(-1)).toBe(0);
  });

  it('follows exponential backoff: [1s, 2s, 4s, 8s, 16s, 30s cap]', () => {
    expect(bubbleBackoffDelayMs(1)).toBe(1000);
    expect(bubbleBackoffDelayMs(2)).toBe(2000);
    expect(bubbleBackoffDelayMs(3)).toBe(4000);
    expect(bubbleBackoffDelayMs(4)).toBe(8000);
    expect(bubbleBackoffDelayMs(5)).toBe(16_000);
    expect(bubbleBackoffDelayMs(6)).toBe(30_000);
    expect(bubbleBackoffDelayMs(10)).toBe(30_000);
  });
});

describe('bubbleQuestionKeyOf', () => {
  it('formats as `${publishId}:${bubbleId}` (2-tuple, no step axis)', () => {
    expect(bubbleQuestionKeyOf(1, 100)).toBe('1:100');
    expect(bubbleQuestionKeyOf(99, 42)).toBe('99:42');
  });
});

// ── Queue behaviour ─────────────────────────────────────────────────

describe('BubbleQuestionPressQueue', () => {
  let warnSpy: jest.SpyInstance;
  let q: BubbleQuestionPressQueue;

  beforeEach(() => {
    jest.useFakeTimers();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    q = new BubbleQuestionPressQueue(makePoster('success'));
  });

  afterEach(() => {
    q._reset();
    warnSpy.mockRestore();
    jest.useRealTimers();
  });

  // (a) enqueue once → snapshot has 1 entry
  it('(a) enqueue once → snapshot().length === 1', () => {
    const poster = makePoster('success');
    q = new BubbleQuestionPressQueue(poster);

    q.enqueue(basePayload);

    expect(q.snapshot()).toHaveLength(1);
    expect(q.snapshot()[0]).toMatchObject({
      key: '1:100',
      publishId: 1,
      bubbleId: 100,
      attempt: 0,
    });
  });

  // (b) same args enqueued twice → still 1 entry (no duplicate)
  it('(b) same args enqueued twice → still 1 entry (no duplicate)', () => {
    const poster = makePoster('retry');
    q = new BubbleQuestionPressQueue(poster);

    q.enqueue(basePayload);
    q.enqueue(basePayload);

    expect(q.snapshot()).toHaveLength(1);
  });

  // (c) mock client returns success → entries empty, successKeys includes key, onSuccess fires once
  it('(c) success → entries cleared, successKeys has key, onSuccess fires once with { publishId, bubbleId }', async () => {
    const poster = makePoster('success');
    q = new BubbleQuestionPressQueue(poster);
    const onSuccess = jest.fn();
    q.setOnSuccess(onSuccess);

    q.enqueue(basePayload);
    await jest.advanceTimersByTimeAsync(0);

    expect(q.snapshot()).toHaveLength(0);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ publishId: 1, bubbleId: 100 })
    );
  });

  // (d) after success, enqueue same key → no-op (snapshot still 0)
  it('(d) after success, enqueue same key → no-op (first-press-only dedupe)', async () => {
    const poster = makePoster('success');
    q = new BubbleQuestionPressQueue(poster);
    const onSuccess = jest.fn();
    q.setOnSuccess(onSuccess);

    q.enqueue(basePayload);
    await jest.advanceTimersByTimeAsync(0);

    expect(q.snapshot()).toHaveLength(0);
    expect(onSuccess).toHaveBeenCalledTimes(1);

    // Re-enqueue same key after success — must be no-op
    q.enqueue(basePayload);
    expect(q.snapshot()).toHaveLength(0);
    expect(onSuccess).toHaveBeenCalledTimes(1); // no additional calls
  });

  // (e) mock client returns 5xx (retry) → entry retained with attempt > 0 and nextAttemptAt advanced
  it('(e) retry (5xx) → entry retained with attempt > 0 and nextAttemptAt advanced per backoff', async () => {
    const poster = makePoster('retry');
    q = new BubbleQuestionPressQueue(poster);

    q.enqueue(basePayload);

    // Initial flush
    await jest.advanceTimersByTimeAsync(0);
    expect(poster).toHaveBeenCalledTimes(1);
    expect(q.snapshot()).toHaveLength(1);
    expect(q.snapshot()[0].attempt).toBe(1);
    expect(q.snapshot()[0].nextAttemptAt).toBeGreaterThan(Date.now());

    // +1s: second attempt (backoff 1s for attempt=1)
    await jest.advanceTimersByTimeAsync(1000);
    expect(poster).toHaveBeenCalledTimes(2);
    expect(q.snapshot()[0].attempt).toBe(2);

    // +2s: third attempt
    await jest.advanceTimersByTimeAsync(2000);
    expect(poster).toHaveBeenCalledTimes(3);
  });

  // Additional: hold (401/403) → retains entry, no attempt increment
  it('hold (401/403) → retains entry, no attempt increment, retries after 10s', async () => {
    const poster = makePoster('hold');
    q = new BubbleQuestionPressQueue(poster);

    q.enqueue(basePayload);
    await jest.advanceTimersByTimeAsync(0);

    expect(q.snapshot()).toHaveLength(1);
    expect(q.snapshot()[0].attempt).toBe(0);
    expect(poster).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(9_999);
    expect(poster).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    expect(poster).toHaveBeenCalledTimes(2);
    expect(q.snapshot()[0].attempt).toBe(0); // hold never increments attempt
  });

  // Additional: _reset clears both entries and successKeys
  it('_reset clears both entries and successKeys', async () => {
    const poster = makePoster('success');
    q = new BubbleQuestionPressQueue(poster);

    q.enqueue(basePayload);
    await jest.advanceTimersByTimeAsync(0);
    expect(q.snapshot()).toHaveLength(0);

    q._reset();

    // After reset, same key can be enqueued again (successKeys cleared)
    const poster2 = makePoster('success');
    q = new BubbleQuestionPressQueue(poster2);
    q.enqueue(basePayload);
    expect(q.snapshot()).toHaveLength(1);
  });

  // pressedBubbleIds() — mount-time merge source. Includes both in-flight + successKeys.
  it('pressedBubbleIds() returns empty Set when nothing enqueued', () => {
    expect(q.pressedBubbleIds()).toEqual(new Set());
  });

  it('pressedBubbleIds() includes in-flight bubbleIds from entries', () => {
    const poster = makePoster('retry'); // keep entry in queue
    q = new BubbleQuestionPressQueue(poster);
    q.enqueue({ publishId: 1, bubbleId: 100 });
    q.enqueue({ publishId: 1, bubbleId: 200 });
    expect(q.pressedBubbleIds()).toEqual(new Set([100, 200]));
  });

  it('pressedBubbleIds() retains succeeded bubbleIds even after entries cleared (race fix)', async () => {
    const poster = makePoster('success');
    q = new BubbleQuestionPressQueue(poster);
    q.enqueue({ publishId: 1, bubbleId: 100 });
    await jest.advanceTimersByTimeAsync(0);
    // entries 비었지만 successKeys 에 100 남아있어야 함
    expect(q.snapshot()).toHaveLength(0);
    expect(q.pressedBubbleIds()).toEqual(new Set([100]));
  });

  it('pressedBubbleIds() merges in-flight + succeeded ids in same instance', async () => {
    // bubbleId 별로 다른 outcome 반환하는 poster.
    const poster = jest
      .fn<Promise<BubbleQuestionFlushOutcome>, [BubbleQuestionPressEntry]>()
      .mockImplementation(async (entry) => (entry.bubbleId === 100 ? 'success' : 'retry'));
    q = new BubbleQuestionPressQueue(poster);

    q.enqueue({ publishId: 1, bubbleId: 100 }); // → success
    q.enqueue({ publishId: 1, bubbleId: 200 }); // → retry (in-flight 유지)
    await jest.advanceTimersByTimeAsync(0);

    expect(q.snapshot().map((e) => e.bubbleId)).toEqual([200]); // 100 은 success 로 dequeue, 200 만 in-flight
    expect(q.pressedBubbleIds()).toEqual(new Set([100, 200])); // union: successKeys + entries
  });
});
