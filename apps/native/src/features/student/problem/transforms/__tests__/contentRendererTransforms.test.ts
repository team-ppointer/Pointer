import type { components } from '@schema';

import {
  buildAllPointingsLeftSections,
  buildAllPointingsRightSections,
  buildAnalysisOverviewSections,
  buildDocumentInit,
  joinBubblesToDoc,
  joinPointingsForAnalysis,
  parseTipTapDoc,
  toAnswerNodes,
  toBubbleNodes,
  toChatScenario,
  toPointingData,
  toQuestionNodes,
  toUserAnswers,
  type JoinedPointing,
  type PendingPointingAnswer,
} from '../contentRendererTransforms';

type PointingWithFeedbackResp = components['schemas']['PointingWithFeedbackResp'];
type ProblemWithStudyInfoResp = components['schemas']['ProblemWithStudyInfoResp'];
type PublishProblemGroupResp = components['schemas']['PublishProblemGroupResp'];
type PointingBubbleResp = components['schemas']['PointingBubbleResp'];

// ── Fixtures ────────────────────────────────────────────────────────

const EMPTY_DOC = { type: 'doc', content: [] };

const paragraph = (text: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  });

const multiBlockDoc = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'p1' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'p2' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'p3' }] },
  ],
});

const mixedNodeDoc = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'intro' }] },
    { type: 'bulletList', content: [] },
    { type: 'table', content: [] },
    { type: 'image', attrs: { src: 'x.png' } },
    { type: 'blockquote', content: [] },
  ],
});

const docWithEmptyParagraphs = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'visible' }] },
    { type: 'paragraph' }, // no content
    { type: 'paragraph', content: [] }, // empty content array
    { type: 'paragraph', content: [{ type: 'text', text: '   ' }] }, // whitespace-only text
    { type: 'paragraph', content: [{ type: 'text', text: '' }] }, // empty string text
    { type: 'table', content: [] }, // non-paragraph; should pass
  ],
});

const makeBubble = (overrides: Partial<PointingBubbleResp> = {}): PointingBubbleResp => ({
  id: 1,
  no: 1,
  contentJson: paragraph('bubble content'),
  ...overrides,
});

const makePointing = (
  overrides: Partial<PointingWithFeedbackResp> = {}
): PointingWithFeedbackResp => ({
  id: 1,
  no: 1,
  questionContent: paragraph('question 1'),
  commentContent: multiBlockDoc,
  concepts: [],
  ...overrides,
});

const makeProblem = (overrides: Partial<ProblemWithStudyInfoResp> = {}): ProblemWithStudyInfoResp =>
  ({
    id: 100,
    no: 1,
    problemType: 'MAIN_PROBLEM',
    customId: 'P1',
    createType: 'GICHUL_PROBLEM',
    practiceTest: {} as unknown,
    practiceTestNo: 1,
    problemContent: paragraph('main problem body'),
    title: 'main',
    answerType: 'MULTIPLE_CHOICE',
    answer: 1,
    difficulty: 1,
    recommendedTimeSec: 60,
    pointings: [],
    submitAnswer: 0,
    isCorrect: false,
    isDone: false,
    childProblems: [],
    ...overrides,
  }) as unknown as ProblemWithStudyInfoResp;

const makeGroup = (
  main: ProblemWithStudyInfoResp,
  childProblems: ProblemWithStudyInfoResp[] = []
): PublishProblemGroupResp =>
  ({
    no: 1,
    problemId: main.id,
    progress: 'DOING',
    problem: { ...main, childProblems },
    childProblems,
  }) as unknown as PublishProblemGroupResp;

// ── parseTipTapDoc (AC-D1) ──────────────────────────────────────────

describe('parseTipTapDoc', () => {
  it('returns empty doc for null/undefined/empty string', () => {
    expect(parseTipTapDoc(null)).toEqual(EMPTY_DOC);
    expect(parseTipTapDoc()).toEqual(EMPTY_DOC);
    expect(parseTipTapDoc('')).toEqual(EMPTY_DOC);
  });

  it('returns empty doc for malformed JSON', () => {
    expect(parseTipTapDoc('not json')).toEqual(EMPTY_DOC);
    expect(parseTipTapDoc('{"broken":')).toEqual(EMPTY_DOC);
  });

  it('returns empty doc when parsed value has no string type field', () => {
    expect(parseTipTapDoc('{}')).toEqual(EMPTY_DOC);
    expect(parseTipTapDoc('null')).toEqual(EMPTY_DOC);
    expect(parseTipTapDoc('[]')).toEqual(EMPTY_DOC);
    expect(parseTipTapDoc('"just a string"')).toEqual(EMPTY_DOC);
    expect(parseTipTapDoc('{"type":123}')).toEqual(EMPTY_DOC);
  });

  it('returns parsed doc when well-formed', () => {
    const input = '{"type":"doc","content":[{"type":"paragraph"}]}';
    expect(parseTipTapDoc(input)).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    });
  });
});

// ── toQuestionNodes (AC-D4) ─────────────────────────────────────────

describe('toQuestionNodes', () => {
  it('returns exactly one bubble wrapping the entire parsed doc', () => {
    const out = toQuestionNodes(multiBlockDoc);
    expect(out).toHaveLength(1);
    expect(out[0].contentNode.type).toBe('doc');
    expect(out[0].contentNode.content).toHaveLength(3);
  });

  it('returns one bubble with empty doc for blank input', () => {
    const out = toQuestionNodes('');
    expect(out).toHaveLength(1);
    expect(out[0].contentNode).toEqual(EMPTY_DOC);
  });
});

// ── toAnswerNodes (AC-D2 / AC-D3 / A1) ─────────────────────────────

const noExpand = { pressedBubbleIds: new Set<number>(), includeExpand: false };

describe('toAnswerNodes', () => {
  it('splits doc.content[] strict top-level into separate bubbles (legacy fallback)', () => {
    const out = toAnswerNodes({ commentContent: multiBlockDoc, ...noExpand });
    expect(out).toHaveLength(3);
    out.forEach((bubble, i) => {
      expect(bubble.contentNode.type).toBe('doc');
      expect(bubble.contentNode.content).toHaveLength(1);
      expect(bubble.contentNode.content?.[0]?.type).toBe('paragraph');
      const text = bubble.contentNode.content?.[0]?.content?.[0]?.text;
      expect(text).toBe(`p${i + 1}`);
    });
  });

  it('filters out empty paragraphs (no content / empty content / whitespace-only / empty text)', () => {
    const out = toAnswerNodes({ commentContent: docWithEmptyParagraphs, ...noExpand });
    // 'visible' paragraph + 'table' block only
    expect(out).toHaveLength(2);
    expect(out[0].contentNode.content?.[0]?.type).toBe('paragraph');
    expect(out[1].contentNode.content?.[0]?.type).toBe('table');
  });

  it('passes through non-paragraph nodes (bulletList / table / image / blockquote)', () => {
    const out = toAnswerNodes({ commentContent: mixedNodeDoc, ...noExpand });
    expect(out).toHaveLength(5);
    expect(out.map((b) => b.contentNode.content?.[0]?.type)).toEqual([
      'paragraph',
      'bulletList',
      'table',
      'image',
      'blockquote',
    ]);
  });

  it('returns empty array when input has no children', () => {
    expect(toAnswerNodes({ commentContent: '{"type":"doc","content":[]}', ...noExpand })).toEqual(
      []
    );
    expect(toAnswerNodes({ commentContent: '', ...noExpand })).toEqual([]);
  });

  // A1: bubbles path used when bubbles present (D2)
  it('uses bubbles path when bubbles array is non-empty (A1, D2)', () => {
    const bubbles = [makeBubble({ id: 1, no: 1 }), makeBubble({ id: 2, no: 2 })];
    const out = toAnswerNodes({ bubbles, commentContent: multiBlockDoc, ...noExpand });
    expect(out).toHaveLength(2);
  });

  // A1: empty bubbles → fallback to commentContent (D2)
  it('falls back to commentContent when bubbles is empty array (A1, D2)', () => {
    const out = toAnswerNodes({ bubbles: [], commentContent: multiBlockDoc, ...noExpand });
    expect(out).toHaveLength(3); // multiBlockDoc has 3 paragraphs
  });

  // A1: undefined bubbles → fallback to commentContent (D2)
  it('falls back to commentContent when bubbles is undefined (A1, D2)', () => {
    const out = toAnswerNodes({ bubbles: undefined, commentContent: multiBlockDoc, ...noExpand });
    expect(out).toHaveLength(3);
  });
});

// ── toPointingData / toChatScenario ─────────────────────────────────

describe('toPointingData', () => {
  it('maps id to string and sets label', () => {
    const data = toPointingData(makePointing({ id: 42 }), 'first', new Set<number>(), false);
    expect(data.id).toBe('42');
    expect(data.label).toBe('first');
    expect(data.questionNodes).toHaveLength(1);
    expect(data.answerNodes).toHaveLength(3);
  });
});

describe('toChatScenario', () => {
  it('labels pointings in order: "1번째 포인팅", "2번째 포인팅", ...', () => {
    const scenario = toChatScenario(
      [makePointing({ id: 10 }), makePointing({ id: 11 }), makePointing({ id: 12 })],
      new Set<number>(),
      false
    );
    expect(scenario.pointings.map((p) => p.label)).toEqual([
      '1번째 포인팅',
      '2번째 포인팅',
      '3번째 포인팅',
    ]);
    expect(scenario.pointings.map((p) => p.id)).toEqual(['10', '11', '12']);
  });

  it('returns empty pointings for empty input', () => {
    expect(toChatScenario([], new Set<number>(), false).pointings).toEqual([]);
  });
});

// ── toUserAnswers (AC-D5) ───────────────────────────────────────────

describe('toUserAnswers', () => {
  const p = (id: number, q?: boolean, c?: boolean) =>
    makePointing({
      id,
      ...(q !== undefined && { isQuestionUnderstood: q }),
      ...(c !== undefined && { isCommentUnderstood: c }),
    });

  it('maps server boolean state to yes/no, omits undefined fields', () => {
    const out = toUserAnswers([p(1, true, false), p(2, false), p(3)]);
    expect(out).toEqual([
      { pointingId: '1', questionResponse: 'yes', confirmResponse: 'no' },
      { pointingId: '2', questionResponse: 'no' },
      { pointingId: '3' },
    ]);
  });

  it('queue entry overrides server value (AC-D5 core)', () => {
    // Server says true, but queue has false → queue wins
    const out = toUserAnswers(
      [p(1, true, true)],
      [
        { pointingId: 1, step: 'question', value: false },
        { pointingId: 1, step: 'confirm', value: false },
      ]
    );
    expect(out[0]).toEqual({
      pointingId: '1',
      questionResponse: 'no',
      confirmResponse: 'no',
    });
  });

  it('queue entry fills in missing server value', () => {
    const out = toUserAnswers(
      [p(1)], // server has neither
      [{ pointingId: 1, step: 'question', value: true }]
    );
    expect(out[0]).toEqual({
      pointingId: '1',
      questionResponse: 'yes',
    });
  });

  it('queue entry for unrelated pointing does not affect others', () => {
    const out = toUserAnswers(
      [p(1, true), p(2)],
      [{ pointingId: 99, step: 'question', value: false }]
    );
    expect(out).toEqual([{ pointingId: '1', questionResponse: 'yes' }, { pointingId: '2' }]);
  });

  it('independent step handling: only question queued, confirm from server', () => {
    const out = toUserAnswers(
      [p(1, undefined, true)],
      [{ pointingId: 1, step: 'question', value: false }]
    );
    expect(out[0]).toEqual({
      pointingId: '1',
      questionResponse: 'no',
      confirmResponse: 'yes',
    });
  });
});

// ── joinPointingsForAnalysis (AC-D6) ────────────────────────────────

describe('joinPointingsForAnalysis', () => {
  it('orders as child0 → child1 → ... → main', () => {
    const c0 = makeProblem({ id: 201, no: 1, pointings: [makePointing({ id: 10 })] });
    const c1 = makeProblem({ id: 202, no: 2, pointings: [makePointing({ id: 20 })] });
    const main = makeProblem({
      id: 100,
      no: 1,
      pointings: [makePointing({ id: 30 })],
    });
    const group = makeGroup(main, [c0, c1]);

    const joined = joinPointingsForAnalysis(group);
    expect(joined.map((j) => j.pointing.id)).toEqual([10, 20, 30]);
    expect(joined.map((j) => j.parentProblemDisplayNo)).toEqual(['1-1', '1-2', '1']);
  });

  it('handles main-only (no children) case', () => {
    const main = makeProblem({
      pointings: [makePointing({ id: 10 }), makePointing({ id: 11 })],
    });
    const group = makeGroup(main, []);
    const joined = joinPointingsForAnalysis(group);
    expect(joined.map((j) => j.pointing.id)).toEqual([10, 11]);
    expect(joined.every((j) => j.parentProblemDisplayNo === '1')).toBe(true);
  });

  it('handles pointings missing (empty arrays)', () => {
    const c0 = makeProblem({ id: 201, no: 1, pointings: [] });
    const main = makeProblem({ pointings: [] });
    const group = makeGroup(main, [c0]);
    expect(joinPointingsForAnalysis(group)).toEqual([]);
  });
});

// ── buildDocumentInit ───────────────────────────────────────────────

describe('buildDocumentInit', () => {
  it('builds document init with parsed content and optional fields', () => {
    const init = buildDocumentInit({
      content: paragraph('hello'),
      fontStyle: 'serif',
      padding: 20,
    });
    expect(init).toMatchObject({
      type: 'init',
      mode: 'document',
      fontStyle: 'serif',
      padding: 20,
    });
    expect(init.content.type).toBe('doc');
  });

  it('omits fields that are not provided', () => {
    const init = buildDocumentInit({ content: '' });
    expect(init.type).toBe('init');
    expect(init.mode).toBe('document');
    expect(init).not.toHaveProperty('fontStyle');
    expect(init).not.toHaveProperty('padding');
    expect(init).not.toHaveProperty('backgroundColor');
    expect(init.content).toEqual(EMPTY_DOC);
  });
});

// ── buildAllPointingsLeftSections (AC-D7: main-first order) ─────────

describe('buildAllPointingsLeftSections', () => {
  it('orders as main → child0 → child1 → ...', () => {
    const c0 = makeProblem({ id: 201, no: 1, problemContent: paragraph('c0') });
    const c1 = makeProblem({ id: 202, no: 2, problemContent: paragraph('c1') });
    const c2 = makeProblem({ id: 203, no: 3, problemContent: paragraph('c2') });
    const main = makeProblem({ id: 100, no: 1, problemContent: paragraph('main') });
    const group = makeGroup(main, [c0, c1, c2]);

    const sections = buildAllPointingsLeftSections(group);
    expect(sections.map((s) => s.id)).toEqual([
      'problem-100',
      'problem-201',
      'problem-202',
      'problem-203',
    ]);
    expect(sections.map((s) => s.tabLabel)).toEqual(['문제 1번', '1-1번', '1-2번', '1-3번']);
    sections.forEach((s) => {
      expect(s.display.type).toBe('plain');
    });
  });

  it('main-only group returns single section', () => {
    const main = makeProblem();
    const group = makeGroup(main, []);
    expect(buildAllPointingsLeftSections(group)).toHaveLength(1);
  });
});

// ── buildAllPointingsRightSections ─────────────────────────────────

describe('buildAllPointingsRightSections', () => {
  it('produces pointing cards with correct ids, labels, and bookmark state', () => {
    const joined: JoinedPointing[] = [
      { pointing: makePointing({ id: 10, no: 1 }), parentProblemDisplayNo: '1-1' },
      { pointing: makePointing({ id: 11, no: 2 }), parentProblemDisplayNo: '1-1' },
      { pointing: makePointing({ id: 30, no: 1 }), parentProblemDisplayNo: '1' },
    ];
    const sections = buildAllPointingsRightSections({
      joined,
      scrappedPointingIds: new Set([11]),
    });

    expect(sections.map((s) => s.id)).toEqual(['pointing:10', 'pointing:11', 'pointing:30']);
    expect(sections.map((s) => s.tabLabel)).toEqual(['1번째', '2번째', '3번째']);
    sections.forEach((s, i) => {
      if (s.display.type === 'card' && s.display.variant === 'pointing') {
        expect(s.display.title).toBe(`${i + 1}번째 포인팅`);
        expect(s.display.bookmarkable).toBe(true);
      } else {
        throw new Error('expected pointing card');
      }
    });

    const subtitles = sections.map((s) =>
      s.display.type === 'card' && s.display.variant === 'pointing' ? s.display.subtitle : null
    );
    expect(subtitles).toEqual(['1-1-1번', '1-1-2번', '1-1번']);

    const bookmarkedStates = sections.map((s) =>
      s.display.type === 'card' && s.display.variant === 'pointing' ? s.display.bookmarked : null
    );
    expect(bookmarkedStates).toEqual([false, true, false]);
  });
});

// ── buildAnalysisOverviewSections ───────────────────────────────────

const analysisOpts = { pressedBubbleIds: new Set<number>(), includeExpand: false };

describe('buildAnalysisOverviewSections', () => {
  it('skips readingTip / oneStepMore when fields are empty/missing', () => {
    const problem = makeProblem();
    const sections = buildAnalysisOverviewSections({
      problem,
      joined: [],
      ...analysisOpts,
    });
    expect(sections).toEqual([]);
  });

  it('includes reading + one-step-more cards when fields present', () => {
    const problem = makeProblem({
      readingTipContent: paragraph('reading'),
      oneStepMoreContent: paragraph('one-step-more'),
    } as Partial<ProblemWithStudyInfoResp>);
    const sections = buildAnalysisOverviewSections({ problem, joined: [], ...analysisOpts });
    expect(sections.map((s) => s.id)).toEqual(['reading', 'one-step-more']);
    sections.forEach((s) => {
      if (s.display.type !== 'card' || s.display.variant !== 'default') {
        throw new Error('expected default card');
      }
    });
  });

  it('inserts divider + chat section per joined pointing in order', () => {
    const problem = makeProblem();
    const joined: JoinedPointing[] = [
      { pointing: makePointing({ id: 10 }), parentProblemDisplayNo: '1-1' },
      { pointing: makePointing({ id: 20 }), parentProblemDisplayNo: '1-2' },
    ];
    const sections = buildAnalysisOverviewSections({ problem, joined, ...analysisOpts });
    expect(sections.map((s) => s.id)).toEqual([
      'pointing-divider-0',
      'pointing-chat-10',
      'pointing-divider-1',
      'pointing-chat-20',
    ]);
    expect(sections[0].display.type).toBe('divider');
    expect(sections[1].display.type).toBe('chat');
    expect(sections[2].display.type).toBe('divider');
    expect(sections[3].display.type).toBe('chat');
  });

  it('propagates pending queue entries into per-pointing userAnswers', () => {
    const problem = makeProblem();
    const pointing = makePointing({ id: 99 });
    const joined: JoinedPointing[] = [{ pointing, parentProblemDisplayNo: '1' }];
    const pendingQueueEntries: PendingPointingAnswer[] = [
      { pointingId: 99, step: 'question', value: true },
    ];
    const sections = buildAnalysisOverviewSections({
      problem,
      joined,
      pendingQueueEntries,
      ...analysisOpts,
    });
    const chatSection = sections.find((s) => s.id === 'pointing-chat-99');
    if (!chatSection || chatSection.display.type !== 'chat') {
      throw new Error('chat section missing');
    }
    expect(chatSection.display.userAnswers).toEqual([
      { pointingId: '99', questionResponse: 'yes' },
    ]);
  });
});

// ── toBubbleNodes (D1) ──────────────────────────────────────────────

describe('toBubbleNodes', () => {
  // D1 / A3: no 역순 배열 → 오름차순 정렬
  it('sorts bubbles by no ascending even when input is reversed (A3, D1)', () => {
    const bubbles = [
      makeBubble({ id: 3, no: 3, contentJson: paragraph('c') }),
      makeBubble({ id: 1, no: 1, contentJson: paragraph('a') }),
      makeBubble({ id: 2, no: 2, contentJson: paragraph('b') }),
    ];
    const result = toBubbleNodes({ bubbles, pressedBubbleIds: new Set(), includeExpand: false });
    expect(result).toHaveLength(3);
    expect(result[0].contentNode.content?.[0]?.content?.[0]?.text).toBe('a');
    expect(result[1].contentNode.content?.[0]?.content?.[0]?.text).toBe('b');
    expect(result[2].contentNode.content?.[0]?.content?.[0]?.text).toBe('c');
  });

  // D1: includeExpand:true + isQuestionPressed:true → defaultExpanded:true
  it('sets defaultExpanded:true when isQuestionPressed is true (D1)', () => {
    const bubbles = [makeBubble({ id: 10, no: 1, isQuestionPressed: true })];
    const result = toBubbleNodes({ bubbles, pressedBubbleIds: new Set(), includeExpand: true });
    expect(result[0].defaultExpanded).toBe(true);
    expect(result[0].nodeId).toBe('10');
  });

  // D1: pressedBubbleIds merge — isQuestionPressed:false but id in set → defaultExpanded:true
  it('sets defaultExpanded:true when bubble id is in pressedBubbleIds (D1, queue merge)', () => {
    const bubbles = [makeBubble({ id: 42, no: 1, isQuestionPressed: false })];
    const result = toBubbleNodes({
      bubbles,
      pressedBubbleIds: new Set([42]),
      includeExpand: true,
    });
    expect(result[0].defaultExpanded).toBe(true);
  });

  // R1 / D1: extendContent null → expandContent omitted
  it('omits expandContent when extendContent is null/undefined (R1, D1)', () => {
    const bubbles = [makeBubble({ id: 1, no: 1, extendContent: undefined })];
    const result = toBubbleNodes({ bubbles, pressedBubbleIds: new Set(), includeExpand: true });
    expect(result[0]).not.toHaveProperty('expandContent');
  });

  // PD-3 / D1: includeExpand:false → no nodeId / defaultExpanded / expandContent
  it('omits all expand fields when includeExpand is false (PD-3, D1)', () => {
    const extendContent = paragraph('extra');
    const bubbles = [makeBubble({ id: 5, no: 1, isQuestionPressed: true, extendContent })];
    const result = toBubbleNodes({
      bubbles,
      pressedBubbleIds: new Set([5]),
      includeExpand: false,
    });
    expect(result[0]).not.toHaveProperty('nodeId');
    expect(result[0]).not.toHaveProperty('defaultExpanded');
    expect(result[0]).not.toHaveProperty('expandContent');
  });
});

// ── joinBubblesToDoc (I1) ───────────────────────────────────────────

const inlineMathNode = { type: 'inlineMath', attrs: { content: 'x^2' } };

const docWithTwo = (text: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }, inlineMathNode],
  });

describe('joinBubblesToDoc', () => {
  // I1: 2 bubbles each with 2 nodes → 4 nodes total in order
  it('flattens all bubble content[] into a single doc (I1)', () => {
    const bubbles = [
      makeBubble({ id: 1, no: 1, contentJson: docWithTwo('p1') }),
      makeBubble({ id: 2, no: 2, contentJson: docWithTwo('p2') }),
    ];
    const result = joinBubblesToDoc(bubbles);
    expect(result.type).toBe('doc');
    expect(result.content).toHaveLength(4);
    expect(result.content?.[0]?.content?.[0]?.text).toBe('p1');
    expect(result.content?.[1]).toMatchObject({ type: 'inlineMath' });
    expect(result.content?.[2]?.content?.[0]?.text).toBe('p2');
    expect(result.content?.[3]).toMatchObject({ type: 'inlineMath' });
  });

  // I1 / BE-3: no 역순 → 오름차순 정렬
  it('sorts by no ascending before joining (I1, BE-3)', () => {
    const bubbles = [
      makeBubble({ id: 2, no: 2, contentJson: paragraph('second') }),
      makeBubble({ id: 1, no: 1, contentJson: paragraph('first') }),
    ];
    const result = joinBubblesToDoc(bubbles);
    expect(result.content?.[0]?.content?.[0]?.text).toBe('first');
    expect(result.content?.[1]?.content?.[0]?.text).toBe('second');
  });

  // A2 / I1: empty/invalid contentJson → EMPTY_DOC → contributes 0 nodes; others remain
  it('ignores bubbles with empty/invalid contentJson (A2, I1)', () => {
    const bubbles = [
      makeBubble({ id: 1, no: 1, contentJson: '' }),
      makeBubble({ id: 2, no: 2, contentJson: paragraph('valid') }),
      makeBubble({ id: 3, no: 3, contentJson: 'not-json' }),
    ];
    const result = joinBubblesToDoc(bubbles);
    // Only the 'valid' bubble contributes 1 paragraph node
    expect(result.content).toHaveLength(1);
    expect(result.content?.[0]?.content?.[0]?.text).toBe('valid');
  });
});
