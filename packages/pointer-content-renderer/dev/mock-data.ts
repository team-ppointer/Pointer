import type {
  JSONNode,
  ChatScenario,
  OverviewSection,
  UserAnswer,
} from '../src/types';

// ── Helper: create a text node ──
function text(t: string, marks?: JSONNode['marks']): JSONNode {
  return { type: 'text', text: t, marks };
}

function paragraph(...nodes: JSONNode[]): JSONNode {
  return { type: 'paragraph', content: nodes };
}

function inlineMath(latex: string): JSONNode {
  return { type: 'inlineMath', attrs: { latex } };
}

function bold(t: string): JSONNode {
  return text(t, [{ type: 'bold' }]);
}

function highlight(t: string, color: string): JSONNode {
  return text(t, [{ type: 'highlight', attrs: { color } }]);
}

// ── Document mode mock ──

export const mockDocumentContent: JSONNode = {
  type: 'doc',
  content: [
    paragraph(text('다음 등식을 만족하는 실수 '), inlineMath('x'), text('의 값을 구하시오.')),
    paragraph(inlineMath('x^2 + 3x - 10 = 0')),
    {
      type: 'blockquote',
      content: [
        paragraph(highlight('조건', 'var(--tt-color-highlight-yellow)'), text(': '), inlineMath('x > 0')),
      ],
    },
    paragraph(text('보기에서 올바른 것을 모두 고르시오.')),
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            { type: 'tableCell', attrs: { colspan: 1, rowspan: 1 }, content: [paragraph(inlineMath('x = 2'))] },
            { type: 'tableCell', attrs: { colspan: 1, rowspan: 1 }, content: [paragraph(inlineMath('x = -5'))] },
            { type: 'tableCell', attrs: { colspan: 1, rowspan: 1 }, content: [paragraph(inlineMath('x = 5'))] },
          ],
        },
        {
          type: 'tableRow',
          content: [
            { type: 'tableCell', attrs: { colspan: 1, rowspan: 1 }, content: [paragraph(inlineMath('x = -2'))] },
            { type: 'tableCell', attrs: { colspan: 1, rowspan: 1 }, content: [paragraph(inlineMath('x = 10'))] },
            { type: 'tableCell', attrs: { colspan: 1, rowspan: 1 }, content: [paragraph(text(''))] },
          ],
        },
      ],
    },
    { type: 'horizontalRule' },
    paragraph(bold('풀이'), text(': 인수분해를 이용하면 '), inlineMath('(x+5)(x-2) = 0'), text('이므로')),
    paragraph(inlineMath('x = -5'), text(' 또는 '), inlineMath('x = 2')),
    paragraph(text('조건에서 '), inlineMath('x > 0'), text('이므로 '), inlineMath('x = 2')),
  ],
};

// ── Chat mode mock ──

function makeNode(content: JSONNode, expand?: JSONNode) {
  return expand ? { contentNode: content, expandContent: expand } : { contentNode: content };
}

export const mockChatScenario: ChatScenario = {
  pointings: [
    {
      id: 'p1',
      label: '1번째 포인팅',
      questionNodes: [
        makeNode(
          { type: 'doc', content: [paragraph(text('이 문제에서 구해야 하는 것이 무엇인지 알고 있나요?'))] },
        ),
        makeNode(
          { type: 'doc', content: [paragraph(text('등식 '), inlineMath('x^2 + 3x - 10 = 0'), text('을 만족하는 실수 '), inlineMath('x'), text('의 값을 구해야 해요.'))] },
          { type: 'doc', content: [paragraph(text('이차방정식의 해를 구하는 문제입니다. 인수분해, 근의 공식 등을 활용할 수 있어요.'))] },
        ),
      ],
      answerNodes: [
        makeNode(
          { type: 'doc', content: [paragraph(text('이 이차방정식을 인수분해하면'))] },
        ),
        makeNode(
          { type: 'doc', content: [paragraph(inlineMath('x^2 + 3x - 10 = (x+5)(x-2) = 0'))] },
        ),
        makeNode(
          { type: 'doc', content: [paragraph(text('따라서 '), inlineMath('x = -5'), text(' 또는 '), inlineMath('x = 2'), text(' 입니다.'))] },
          { type: 'doc', content: [paragraph(text('인수분해가 어려우면 근의 공식 '), inlineMath('x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'), text('를 사용해도 됩니다.'))] },
        ),
      ],
    },
    {
      id: 'p2',
      label: '2번째 포인팅',
      questionNodes: [
        makeNode(
          { type: 'doc', content: [paragraph(text('조건 '), inlineMath('x > 0'), text('을 적용하면 답이 어떻게 되나요?'))] },
        ),
      ],
      answerNodes: [
        makeNode(
          { type: 'doc', content: [paragraph(inlineMath('x = -5'), text('는 조건 '), inlineMath('x > 0'), text('을 만족하지 않으므로'))] },
        ),
        makeNode(
          { type: 'doc', content: [paragraph(bold('답: '), inlineMath('x = 2'))] },
        ),
      ],
    },
  ],
};

// ── Overview mode mock ──

const completedAnswers: UserAnswer[] = [
  { pointingId: 'p1', questionResponse: 'yes', confirmResponse: 'yes' },
  { pointingId: 'p2', questionResponse: 'no', confirmResponse: 'yes' },
];

export const mockOverviewSections: OverviewSection[] = [
  {
    id: 'problem',
    display: {
      type: 'card',
      variant: 'default',
      content: mockDocumentContent,
      bookmarkable: true,
      bookmarked: false,
    },
  },
  {
    id: 'div1',
    display: { type: 'divider', text: '1번째 포인팅' },
  },
  {
    id: 'pointing-chat',
    display: {
      type: 'chat',
      scenario: mockChatScenario,
      userAnswers: completedAnswers,
    },
  },
  {
    id: 'solution',
    display: {
      type: 'plain',
      content: {
        type: 'doc',
        content: [
          paragraph(bold('풀이 요약')),
          paragraph(text('인수분해를 통해 '), inlineMath('(x+5)(x-2)=0'), text('을 구한 뒤, 조건 '), inlineMath('x>0'), text('을 적용하여 '), inlineMath('x=2'), text('를 도출합니다.')),
        ],
      },
      collapsible: true,
    },
  },
  {
    id: 'concept',
    display: {
      type: 'card',
      variant: 'pointing',
      content: {
        type: 'doc',
        content: [
          paragraph(highlight('핵심 개념', 'var(--tt-color-highlight-blue)'), text(': 이차방정식의 인수분해')),
          paragraph(text('이차방정식 '), inlineMath('ax^2 + bx + c = 0'), text('에서 좌변을 인수분해하여 해를 구할 수 있습니다.')),
        ],
      },
      bookmarkable: true,
      bookmarked: true,
    },
  },
];
