import type { JSONNode, ChatScenario, OverviewSection, UserAnswer, HomeCard } from '../src/types';

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

// ── Document mode mock ──

export const mockDocumentContent: JSONNode = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: {
        textAlign: null,
      },
      content: [
        {
          type: 'text',
          text: '함수 ',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: 'f(x)',
          },
        },
        {
          type: 'text',
          text: ' 는 구간 ',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: '(-1, 1]',
          },
        },
        {
          type: 'text',
          text: ' 에서 ',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: 'f(x)=(x-1)(2x-1)(x+1)',
          },
        },
        {
          type: 'text',
          text: ' 이고 모든 실수 ',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: 'x',
          },
        },
        {
          type: 'text',
          text: ' 에 대하여 ',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: 'f(x+2)=f(x)',
          },
        },
        {
          type: 'text',
          text: ' 이다. ',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: 'a > 1',
          },
        },
        {
          type: 'text',
          text: ' 에 대하여 함수 ',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: 'g(x)',
          },
        },
        {
          type: 'text',
          text: ' 가 ',
        },
        {
          type: 'hardBreak',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: 'g(x) = \\begin{cases} x & (x \\neq 1) \\ a & (x = 1) \\end{cases}',
          },
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'hardBreak',
        },
        {
          type: 'text',
          text: '일 때, 합성함수 ',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: '(f \\circ g)(x)',
          },
        },
        {
          type: 'text',
          text: ' 가 ',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: 'x=1',
          },
        },
        {
          type: 'text',
          text: ' 에서 연속이다. ',
        },
        {
          type: 'inlineMath',
          attrs: {
            latex: 'a',
          },
        },
        {
          type: 'text',
          text: ' 의 최솟값은?',
        },
      ],
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
              },
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex: '2',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
              },
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex: '\\frac52',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
              },
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex: '3',
                      },
                    },
                    {
                      type: 'text',
                      text: ' ',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
              },
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex: '\\frac72',
                      },
                    },
                    {
                      type: 'text',
                      text: ' ',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
              },
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex: '4',
                      },
                    },
                    {
                      type: 'text',
                      text: ' ',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        textAlign: null,
      },
    },
  ],
};

// ── Chat mode mock ──

function makeNode(content: JSONNode, expand?: JSONNode, defaultExpanded?: boolean) {
  return {
    contentNode: content,
    ...(expand && { expandContent: expand }),
    ...(defaultExpanded && { defaultExpanded: true }),
  };
}

export const mockChatScenario: ChatScenario = {
  pointings: [
    {
      id: 'p1',
      label: '1번째 포인팅',
      questionNodes: [
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'text',
                  text: '연속의 정의를 이용해 합성함수 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'f\\left(g\\left(x\\right)\\right)',
                  },
                },
                {
                  type: 'text',
                  text: ' 가 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'x=1',
                  },
                },
                {
                  type: 'text',
                  text: ' 에서 연속이도록 하는 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'a',
                  },
                },
                {
                  type: 'text',
                  text: ' 의 조건을 구해봤나요?',
                },
              ],
            },
          ],
        }),
      ],
      answerNodes: [
        makeNode(
          {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: {
                  textAlign: null,
                },
                content: [
                  {
                    type: 'text',
                    text: '문제에서 합성함수 ',
                  },
                  {
                    type: 'inlineMath',
                    attrs: {
                      latex: '(f \\circ g)(x)',
                    },
                  },
                  {
                    type: 'text',
                    text: ', 즉 ',
                  },
                  {
                    type: 'inlineMath',
                    attrs: {
                      latex: 'f(g(x))',
                    },
                  },
                  {
                    type: 'text',
                    text: ' 가 ',
                  },
                  {
                    type: 'inlineMath',
                    attrs: {
                      latex: 'x = 1',
                    },
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-blue)',
                        },
                      },
                    ],
                  },
                  {
                    type: 'text',
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-blue)',
                        },
                      },
                    ],
                    text: ' 이라는 특정점에서의 연속 조건이 주어졌으므로',
                  },
                  {
                    type: 'text',
                    text: ', ',
                  },
                  {
                    type: 'text',
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-purple)',
                        },
                      },
                    ],
                    text: '연속의 정의',
                  },
                  {
                    type: 'text',
                    text: '를 이용해 해결해보자.',
                  },
                ],
              },
            ],
          },
          {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { textAlign: null },
                content: [
                  { type: 'text', text: '연속의 정의: 함수 ' },
                  { type: 'inlineMath', attrs: { latex: 'f' } },
                  { type: 'text', text: ' 가 ' },
                  { type: 'inlineMath', attrs: { latex: 'x = c' } },
                  { type: 'text', text: ' 에서 연속이려면 ' },
                  { type: 'inlineMath', attrs: { latex: '\\lim_{x \\to c} f(x) = f(c)' } },
                  { type: 'text', text: ' 가 성립해야 합니다.' },
                ],
              },
            ],
          },
          true
        ),
        makeNode(
          {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: {
                  textAlign: null,
                },
                content: [
                  {
                    type: 'inlineMath',
                    attrs: {
                      latex: 'x=1',
                    },
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-green)',
                        },
                      },
                    ],
                  },
                  {
                    type: 'text',
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-green)',
                        },
                      },
                    ],
                    text: ' 에서 연속이기 위해서는',
                  },
                  {
                    type: 'text',
                    text: ' ',
                  },
                  {
                    type: 'text',
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-yellow)',
                        },
                      },
                    ],
                    text: '연속의 정의에 따라 극한값과 함숫값이 같아야 하므로',
                  },
                  {
                    type: 'text',
                    text: ' ',
                  },
                  {
                    type: 'inlineMath',
                    attrs: {
                      latex: '\\lim_{x \\to 1} f(g(x)) = f(g(1))',
                    },
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-yellow)',
                        },
                      },
                    ],
                  },
                  {
                    type: 'text',
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-yellow)',
                        },
                      },
                    ],
                    text: ' ',
                  },
                  {
                    type: 'text',
                    text: '이 성립해야 한다. .',
                  },
                ],
              },
            ],
          },
          {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { textAlign: null },
                content: [
                  {
                    type: 'text',
                    text: '극한값과 함숫값이 일치하는지 좌극한, 우극한, 함숫값 세 가지를 각각 확인해보세요.',
                  },
                ],
              },
            ],
          }
        ),
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'x \\to 1',
                  },
                },
                {
                  type: 'text',
                  text: ' 로 갈 때, ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'x \\neq 1',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' 이므로 함수 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'g\\left(x\\right)',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' 는 함수 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'g(x) = x',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  text: ' 이다.  따라서',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: '\\lim_{x \\to 1} f(g(x)) = \\lim_{x \\to 1} f(x)',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  text: ' 가 된다.  ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: '극한값이 존재하는지 좌극한과 우극한으로 나누어 확인해 보자',
                },
                {
                  type: 'text',
                  text: '.',
                },
              ],
            },
          ],
        }),
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-red)',
                      },
                    },
                  ],
                  text: '좌극한',
                },
                {
                  type: 'text',
                  text: ': ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'x \\to 1-',
                  },
                },
                {
                  type: 'text',
                  text: ' 일 때는 주어진 구간 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: '(-1, 1]',
                  },
                },
                {
                  type: 'text',
                  text: ' 에 속하므로 함수 식에 바로 대입한다.',
                },
              ],
            },
          ],
        }),
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'inlineMath',
                  attrs: {
                    latex:
                      '\\lim_{x \\to 1-} f(x) = \\lim_{x \\to 1-} (x-1)(2x-1)(x+1) = (0)(1)(2) = 0',
                  },
                },
                {
                  type: 'text',
                  text: ' 이다.',
                },
              ],
            },
          ],
        }),
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-red)',
                      },
                    },
                  ],
                  text: '우극한',
                },
                {
                  type: 'text',
                  text: ':',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: ' ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'x \\to 1+',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: ' 일 때는 주어진 구간을 벗어나지만',
                },
                {
                  type: 'text',
                  text: ', ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: '주기함수 조건 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'f(x+2) = f(x)',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: ' 를 이용하면',
                },
                {
                  type: 'text',
                  text: ' ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: '한 주기 앞인 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'x \\to -1+',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' 로 끌고 올 수 있다. ',
                },
              ],
            },
          ],
        }),
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'text',
                  text: '(식으로 표현하면 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex:
                      '\\lim_{x \\to 1+} f(x) = \\lim_{x \\to -1+} f(x+2) = \\lim_{t \\to -1+} f(t)',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  text: ' 이다)',
                },
              ],
            },
          ],
        }),
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 't \\to -1+',
                  },
                },
                {
                  type: 'text',
                  text: ' 역시 주어진 구간 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: '(-1, 1]',
                  },
                },
                {
                  type: 'text',
                  text: ' 에 속하므로 식에 대입하면 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: '(-1-1)\\{2(-1)-1\\}(-1+1)',
                  },
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: '=(-2)(-3)(0)=0',
                  },
                },
                {
                  type: 'text',
                  text: ' 이다.',
                },
              ],
            },
          ],
        }),
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'text',
                  text: '따라서',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'x=1',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' 에서 극한값은 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: '0',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  text: ' 임을 구할 수 있다. ',
                },
              ],
            },
          ],
        }),
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'text',
                  text: '이제 ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: '함숫값을 구해보면 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'x=1',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: ' 일 때 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'g(1) = a',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: ' , ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'f(g(1)) = f(a)',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  text: ' 이므로 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'x=1',
                  },
                },
                {
                  type: 'text',
                  text: ' 에서 연속이기 위해서는',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'f(a) = 0',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' ',
                },
                {
                  type: 'text',
                  text: '을 만족해야한다.',
                },
              ],
            },
          ],
        }),
      ],
    },
    {
      id: 'p2',
      label: '2번째 포인팅',
      questionNodes: [
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'f\\left(a\\right)=0',
                  },
                },
                {
                  type: 'text',
                  text: ' 을 만족하는 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'a',
                  },
                },
                {
                  type: 'text',
                  text: ' 의 최솟값을 주기를 이용해 구했나요?',
                },
              ],
            },
          ],
        }),
      ],
      answerNodes: [
        makeNode(
          {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: {
                  textAlign: null,
                },
                content: [
                  {
                    type: 'text',
                    text: '먼저 주어진 구간 ',
                  },
                  {
                    type: 'inlineMath',
                    attrs: {
                      latex: '(-1, 1]',
                    },
                  },
                  {
                    type: 'text',
                    text: ' 에서 ',
                  },
                  {
                    type: 'inlineMath',
                    attrs: {
                      latex: 'f(x) = 0',
                    },
                  },
                  {
                    type: 'text',
                    text: ' 을 만족시키는 실수 ',
                  },
                  {
                    type: 'inlineMath',
                    attrs: {
                      latex: 'x',
                    },
                  },
                  {
                    type: 'text',
                    text: ' 를  찾으면',
                  },
                  {
                    type: 'text',
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-yellow)',
                        },
                      },
                    ],
                    text: ' ',
                  },
                  {
                    type: 'inlineMath',
                    attrs: {
                      latex: 'x=\\frac{1}{2}',
                    },
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-yellow)',
                        },
                      },
                    ],
                  },
                  {
                    type: 'text',
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-yellow)',
                        },
                      },
                    ],
                    text: ', ',
                  },
                  {
                    type: 'inlineMath',
                    attrs: {
                      latex: '1',
                    },
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-yellow)',
                        },
                      },
                    ],
                  },
                  {
                    type: 'text',
                    marks: [
                      {
                        type: 'highlight',
                        attrs: {
                          color: 'var(--tt-color-highlight-yellow)',
                        },
                      },
                    ],
                    text: ' ',
                  },
                  {
                    type: 'text',
                    text: '이다. ',
                  },
                ],
              },
            ],
          },
          {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { textAlign: null },
                content: [{ type: 'text', text: '주기를 이용해 구간을 확장해보세요.' }],
              },
            ],
          }
        ),
        makeNode({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: 'text',
                  text: '이때 ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-blue)',
                      },
                    },
                  ],
                  text: '실수 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'a',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-blue)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-blue)',
                      },
                    },
                  ],
                  text: ' 의 범위는 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'a>1',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-blue)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  text: ' 이므로 ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: '모든 실수 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'x',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: ' 에 대하여 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'f\\left(x+2\\right)=f\\left(x\\right)',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-green)',
                      },
                    },
                  ],
                  text: ' 를 만족하는 것을 이용',
                },
                {
                  type: 'text',
                  text: '하여',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'f\\left(a\\right)=0',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' 와 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'a>1',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' 를 만족시키는',
                },
                {
                  type: 'text',
                  text: ' 실수 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'a',
                  },
                },
                {
                  type: 'text',
                  text: ' 의 값을 찾으면',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'a=\\frac52',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ', ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: '3',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ',… ',
                },
                {
                  type: 'text',
                  text: '이므로 가능한 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: 'a',
                  },
                },
                {
                  type: 'text',
                  text: ' 의 ',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: '최솟값은 ',
                },
                {
                  type: 'inlineMath',
                  attrs: {
                    latex: '\\frac52',
                  },
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'highlight',
                      attrs: {
                        color: 'var(--tt-color-highlight-yellow)',
                      },
                    },
                  ],
                  text: ' ',
                },
                {
                  type: 'text',
                  text: '임을 구할 수 있다. ',
                },
              ],
            },
          ],
        }),
      ],
    },
  ],
};

// ── Overview mode mock ──

const completedAnswers: UserAnswer[] = [
  { pointingId: 'p1', questionResponse: 'yes', confirmResponse: 'yes' },
  { pointingId: 'p2', questionResponse: 'no', confirmResponse: 'yes' },
];

// ── Chat resume scenarios ──

/** Resume with only the first pointing's question answered (partial). */
export const mockChatResumeAfterQuestion: UserAnswer[] = [
  { pointingId: 'p1', questionResponse: 'yes' },
];

/** Resume with the first pointing fully complete, second pending. */
export const mockChatResumeAfterFirstPointing: UserAnswer[] = [
  { pointingId: 'p1', questionResponse: 'yes', confirmResponse: 'no' },
];

/** Resume with first pointing done and second pointing's question answered. */
export const mockChatResumeMidSecond: UserAnswer[] = [
  { pointingId: 'p1', questionResponse: 'yes', confirmResponse: 'yes' },
  { pointingId: 'p2', questionResponse: 'no' },
];

/** All pointings fully answered — edge case. */
export const mockChatResumeAllComplete: UserAnswer[] = completedAnswers;

export const mockOverviewSections: OverviewSection[] = [
  {
    id: 'reading',
    tabLabel: '문항 읽어내려갈 때',
    display: {
      type: 'card',
      variant: 'default',
      displayLabel: '문항 읽어내려갈 때',
      content: {
        type: 'doc',
        content: [
          paragraph(
            text('(1) '),
            inlineMath('g\\left(x\\right)'),
            text(' 가 복잡하게 정의되어 있네. '),
            inlineMath('x=1'),
            text(' 일 때와 '),
            inlineMath('x\\ne1'),
            text(' 일 때를 경우를 나눠서 생각해봐야겠다.')
          ),
          paragraph(
            text('(2) '),
            inlineMath('f\\left(x\\right)=f\\left(x+2\\right)'),
            text(' 는 주기가 '),
            inlineMath('2'),
            text(' 라는거 같은데 어떻게 이용해야 할까?')
          ),
          paragraph(
            text('(3) 합성함수 '),
            inlineMath('f\\left(g\\left(x\\right)\\right)'),
            text(' 의 연속성은 먼저 속함수인 '),
            inlineMath('g\\left(x\\right)'),
            text(' 부터 생각해줘야 겠다.')
          ),
        ],
      },
    },
  },
  {
    id: 'onestepmore',
    tabLabel: '한 걸음 더',
    display: {
      type: 'card',
      variant: 'default',
      displayLabel: '한 걸음 더',
      content: {
        type: 'doc',
        content: [
          paragraph(
            text(
              '어려워 보이는 함수식이 나오더라도 연속의 정의란 정석을 이용하면 모두 해결할 수 있다.'
            )
          ),
        ],
      },
    },
  },
  {
    id: 'div1',
    tabLabel: '1번째 포인팅',
    display: { type: 'divider', text: '1번째 포인팅' },
  },
  {
    id: 'pointing-chat-1',
    display: {
      type: 'chat',
      scenario: { pointings: [mockChatScenario.pointings[0]] },
      userAnswers: [completedAnswers[0]],
    },
  },
  {
    id: 'div2',
    tabLabel: '2번째 포인팅',
    display: { type: 'divider', text: '2번째 포인팅' },
  },
  {
    id: 'pointing-chat-2',
    display: {
      type: 'chat',
      scenario: { pointings: [mockChatScenario.pointings[1]] },
      userAnswers: [completedAnswers[1]],
    },
  },
];

export const mockAllLeftSections: OverviewSection[] = [
  {
    id: 'problem1',
    tabLabel: '문제 1번',
    display: {
      type: 'plain',
      content: mockDocumentContent,
    },
  },
  {
    id: 'solution',
    display: {
      type: 'card',
      variant: 'collapsible',
      title: '해설',
      content: {
        type: 'doc',
        content: [
          paragraph(
            text('인수분해를 통해 '),
            inlineMath('(x+5)(x-2)=0'),
            text('을 구한 뒤, 조건 '),
            inlineMath('x>0'),
            text('을 적용하여 '),
            inlineMath('x=2'),
            text('를 도출합니다.')
          ),
        ],
      },
    },
  },
  {
    id: 'hr',
    display: { type: 'divider' },
  },
  {
    id: 'problem11',
    tabLabel: '1-1번',
    display: {
      type: 'plain',
      content: mockDocumentContent,
    },
  },
  {
    id: 'solution2',
    display: {
      type: 'card',
      variant: 'collapsible',
      title: '해설',
      content: {
        type: 'doc',
        content: [
          paragraph(
            text('인수분해를 통해 '),
            inlineMath('(x+5)(x-2)=0'),
            text('을 구한 뒤, 조건 '),
            inlineMath('x>0'),
            text('을 적용하여 '),
            inlineMath('x=2'),
            text('를 도출합니다.')
          ),
        ],
      },
    },
  },
];

export const mockAllRightSections: OverviewSection[] = [
  {
    id: 'pointing-1',
    tabLabel: '1번째',
    display: {
      type: 'card',
      variant: 'pointing',
      title: '1번째 포인팅',
      subtitle: '1-1번',
      question: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'text',
                text: '연속의 정의를 이용해 합성함수 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'f\\left(g\\left(x\\right)\\right)',
                },
              },
              {
                type: 'text',
                text: ' 가 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x=1',
                },
              },
              {
                type: 'text',
                text: ' 에서 연속이도록 하는 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'a',
                },
              },
              {
                type: 'text',
                text: ' 의 조건을 구해봤나요?',
              },
            ],
          },
        ],
      },
      answer: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'text',
                text: '문제에서 합성함수 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '(f \\circ g)(x)',
                },
              },
              {
                type: 'text',
                text: ', 즉 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'f(g(x))',
                },
              },
              {
                type: 'text',
                text: ' 가 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x = 1',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-blue)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-blue)',
                    },
                  },
                ],
                text: ' 이라는 특정점에서의 연속 조건이 주어졌으므로',
              },
              {
                type: 'text',
                text: ', ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-purple)',
                    },
                  },
                ],
                text: '연속의 정의',
              },
              {
                type: 'text',
                text: '를 이용해 해결해보자.',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x=1',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: ' 에서 연속이기 위해서는',
              },
              {
                type: 'text',
                text: ' ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: '연속의 정의에 따라 극한값과 함숫값이 같아야 하므로',
              },
              {
                type: 'text',
                text: ' ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '\\lim_{x \\to 1} f(g(x)) = f(g(1))',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'text',
                text: '이 성립해야 한다. .',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x \\to 1',
                },
              },
              {
                type: 'text',
                text: ' 로 갈 때, ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x \\neq 1',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' 이므로 함수 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'g\\left(x\\right)',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' 는 함수 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'g(x) = x',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                text: ' 이다.  따라서',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '\\lim_{x \\to 1} f(g(x)) = \\lim_{x \\to 1} f(x)',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                text: ' 가 된다.  ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: '극한값이 존재하는지 좌극한과 우극한으로 나누어 확인해 보자',
              },
              {
                type: 'text',
                text: '.',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-red)',
                    },
                  },
                ],
                text: '좌극한',
              },
              {
                type: 'text',
                text: ': ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x \\to 1-',
                },
              },
              {
                type: 'text',
                text: ' 일 때는 주어진 구간 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '(-1, 1]',
                },
              },
              {
                type: 'text',
                text: ' 에 속하므로 함수 식에 바로 대입한다.',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'inlineMath',
                attrs: {
                  latex:
                    '\\lim_{x \\to 1-} f(x) = \\lim_{x \\to 1-} (x-1)(2x-1)(x+1) = (0)(1)(2) = 0',
                },
              },
              {
                type: 'text',
                text: ' 이다.',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-red)',
                    },
                  },
                ],
                text: '우극한',
              },
              {
                type: 'text',
                text: ':',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x \\to 1+',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: ' 일 때는 주어진 구간을 벗어나지만',
              },
              {
                type: 'text',
                text: ', ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: '주기함수 조건 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'f(x+2) = f(x)',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: ' 를 이용하면',
              },
              {
                type: 'text',
                text: ' ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: '한 주기 앞인 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x \\to -1+',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' 로 끌고 올 수 있다. ',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'text',
                text: '(식으로 표현하면 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex:
                    '\\lim_{x \\to 1+} f(x) = \\lim_{x \\to -1+} f(x+2) = \\lim_{t \\to -1+} f(t)',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                text: ' 이다)',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'inlineMath',
                attrs: {
                  latex: 't \\to -1+',
                },
              },
              {
                type: 'text',
                text: ' 역시 주어진 구간 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '(-1, 1]',
                },
              },
              {
                type: 'text',
                text: ' 에 속하므로 식에 대입하면 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '(-1-1)\\{2(-1)-1\\}(-1+1)',
                },
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '=(-2)(-3)(0)=0',
                },
              },
              {
                type: 'text',
                text: ' 이다.',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'text',
                text: '따라서',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x=1',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' 에서 극한값은 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '0',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                text: ' 임을 구할 수 있다. ',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'text',
                text: '이제 ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: '함숫값을 구해보면 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x=1',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: ' 일 때 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'g(1) = a',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: ' , ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'f(g(1)) = f(a)',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                text: ' 이므로 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x=1',
                },
              },
              {
                type: 'text',
                text: ' 에서 연속이기 위해서는',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'f(a) = 0',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'text',
                text: '을 만족해야한다.',
              },
            ],
          },
        ],
      },
      bookmarkable: true,
      bookmarked: false,
    },
  },
  {
    id: 'pointing-2',
    tabLabel: '2번째',
    display: {
      type: 'card',
      variant: 'pointing',
      title: '2번째 포인팅',
      subtitle: '1-1번',
      question: {
        type: 'doc',
        content: [
          {
            type: 'inlineMath',
            attrs: {
              latex: 'f\\left(a\\right)=0',
            },
          },
          {
            type: 'text',
            text: ' 을 만족하는 ',
          },
          {
            type: 'inlineMath',
            attrs: {
              latex: 'a',
            },
          },
          {
            type: 'text',
            text: ' 의 최솟값을 주기를 이용해 구했나요?',
          },
        ],
      },
      answer: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'text',
                text: '먼저 주어진 구간 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '(-1, 1]',
                },
              },
              {
                type: 'text',
                text: ' 에서 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'f(x) = 0',
                },
              },
              {
                type: 'text',
                text: ' 을 만족시키는 실수 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x',
                },
              },
              {
                type: 'text',
                text: ' 를  찾으면',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x=\\frac{1}{2}',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ', ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '1',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'text',
                text: '이다. ',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              textAlign: null,
            },
            content: [
              {
                type: 'text',
                text: '이때 ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-blue)',
                    },
                  },
                ],
                text: '실수 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'a',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-blue)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-blue)',
                    },
                  },
                ],
                text: ' 의 범위는 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'a>1',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-blue)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                text: ' 이므로 ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: '모든 실수 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'x',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: ' 에 대하여 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'f\\left(x+2\\right)=f\\left(x\\right)',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-green)',
                    },
                  },
                ],
                text: ' 를 만족하는 것을 이용',
              },
              {
                type: 'text',
                text: '하여',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'f\\left(a\\right)=0',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' 와 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'a>1',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' 를 만족시키는',
              },
              {
                type: 'text',
                text: ' 실수 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'a',
                },
              },
              {
                type: 'text',
                text: ' 의 값을 찾으면',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'a=\\frac52',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ', ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '3',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ',… ',
              },
              {
                type: 'text',
                text: '이므로 가능한 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: 'a',
                },
              },
              {
                type: 'text',
                text: ' 의 ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: '최솟값은 ',
              },
              {
                type: 'inlineMath',
                attrs: {
                  latex: '\\frac52',
                },
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'highlight',
                    attrs: {
                      color: 'var(--tt-color-highlight-yellow)',
                    },
                  },
                ],
                text: ' ',
              },
              {
                type: 'text',
                text: '임을 구할 수 있다. ',
              },
            ],
          },
        ],
      },
      bookmarkable: true,
      bookmarked: true,
    },
  },
];

// ── Home mode mock ──

export const mockHomeCards: HomeCard[] = [
  {
    type: 'comment',
    timeRemainingInHours: 24,
    content: {
      type: 'doc',
      content: [
        paragraph(
          text(
            '출제진이 직접 작성한 내용(Content이 나타나는 영역입니다. LaTex, 수식, Markup이 포함됩니다. '
          )
        ),
        paragraph(
          text(
            '출제진이 직접 작성한 내용(Content이 나타나는 영역입니다. LaTex, 수식, Markup이 포함됩니다. '
          )
        ),
        paragraph(
          text('함수 '),
          inlineMath('f(x) = x^2 + 3x - 5'),
          text(' 의 극솟값을 구하면 '),
          inlineMath('f\\left(-\\frac{3}{2}\\right) = -\\frac{29}{4}'),
          text(' 이다.')
        ),
        paragraph(
          text(
            '출제진이 직접 작성한 내용(Content이 나타나는 영역입니다. LaTex, 수식, Markup이 포함됩니다.'
          )
        ),
      ],
    },
  },
  {
    type: 'study-summary',
    groups: [
      {
        label: '오늘의 학습',
        highlighted: true,
        items: [
          {
            badges: [{ text: '집중학습', variant: 'orange' }],
            title: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [
                    { type: 'inlineMath', attrs: { latex: 'y=\\sin x' } },
                    { text: '의 미분계수', type: 'text' },
                  ],
                },
              ],
            },
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex: '\\frac{\\mathrm{d}}{\\mathrm{d}x}\\sin x = \\cos x',
                      },
                    },
                    { text: ' 이므로, ', type: 'text' },
                    { type: 'inlineMath', attrs: { latex: '\\sin x' } },
                    { text: '의 미분계수는 ', type: 'text' },
                    { type: 'inlineMath', attrs: { latex: '\\cos x' } },
                    { text: '이다.', type: 'text' },
                  ],
                },
              ],
            },
            content: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\left| \\frac{ \\displaystyle \\sum_{k=1}^{n} \\left(   \\frac{k^2-3k+2}{k^2+k}   -   \\frac{k-1}{k+1} \\right) }{ \\displaystyle \\sqrt{   \\left(     \\sum_{k=1}^{n} k   \\right)^2   -   \\sum_{k=1}^{n} k^2 } } \\right| = \\frac{ \\displaystyle \\left| \\sum_{k=1}^{n} \\frac{2(1-k)}{k(k+1)} \\right| }{ \\displaystyle \\sqrt{ \\frac{n^2(n+1)^2}{4} - \\frac{n(n+1)(2n+1)}{6} } }',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\int_{0}^{2} \\left| x^3-3x^2+2x \\right|\\,dx = \\int_{0}^{1} \\left(x^3-3x^2+2x\\right)\\,dx - \\int_{1}^{2} \\left(x^3-3x^2+2x\\right)\\,dx',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\left\\{ \\begin{array}{ll} \\displaystyle f(x)=x^2-2ax+a^2-1, & x<a \\\\[0.8em] \\displaystyle f(x)= \\frac{x^2-a^2}{x-a}, & x>a \\\\[0.8em] \\displaystyle \\lim_{x\\to a-}f(x) = \\lim_{x\\to a+}f(x) = f(a) \\end{array} \\right.',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\frac{ \\displaystyle \\binom{n}{0} - 2\\binom{n}{1} + 3\\binom{n}{2} - \\cdots + (-1)^n(n+1)\\binom{n}{n} }{ \\displaystyle \\sum_{k=0}^{n} \\binom{n}{k}2^{n-k}(-1)^k } = \\frac{ \\displaystyle \\sum_{k=0}^{n} (-1)^k(k+1)\\binom{n}{k} }{ \\displaystyle (2-1)^n }',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\left( \\frac{ \\displaystyle \\sqrt{x+2\\sqrt{x-1}} - \\sqrt{x-2\\sqrt{x-1}} }{ \\displaystyle \\sqrt{x+2\\sqrt{x-1}} + \\sqrt{x-2\\sqrt{x-1}} } \\right)^2 = \\frac{ \\displaystyle x-\\sqrt{x^2-4x+4} }{ \\displaystyle x+\\sqrt{x^2-4x+4} }',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\sum_{k=1}^{n} \\frac{ \\displaystyle 1 }{ \\displaystyle \\sqrt{k+1}+\\sqrt{k} } = \\sum_{k=1}^{n} \\left( \\sqrt{k+1}-\\sqrt{k} \\right) = \\sqrt{n+1}-1',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\left\\{ \\begin{array}{rcl} \\displaystyle a_{n+1} &=& \\displaystyle \\frac{ 2a_n+3 }{ a_n+2 } \\\\[1em] \\displaystyle b_n &=& \\displaystyle \\frac{ a_n-3 }{ a_n+1 } \\\\[1em] \\displaystyle b_{n+1} &=& \\displaystyle -\\frac{1}{4}b_n \\end{array} \\right.',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\left[ \\begin{array}{c} \\displaystyle \\lim_{x\\to 0} \\frac{ \\sqrt{1+ax}-\\sqrt{1-bx} }{ x } \\\\[1.2em] \\displaystyle = \\lim_{x\\to 0} \\frac{ (a+b)x }{ x\\left(\\sqrt{1+ax}+\\sqrt{1-bx}\\right) } \\\\[1.2em] \\displaystyle = \\frac{a+b}{2} \\end{array} \\right]',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\left| \\begin{array}{cc} \\displaystyle \\frac{x^2-1}{x-1} & \\displaystyle \\sqrt{x^2-2x+1} \\\\[1em] \\displaystyle \\int_{0}^{x}(t^2-2t+1)\\,dt & \\displaystyle \\sum_{k=1}^{x} \\left(2k-1\\right) \\end{array} \\right| = \\left| \\begin{array}{cc} \\displaystyle x+1 & \\displaystyle |x-1| \\\\[1em] \\displaystyle \\frac{x^3}{3}-x^2+x & \\displaystyle x^2 \\end{array} \\right|',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\frac{ \\displaystyle \\int_{0}^{1} \\left(   ax^2+bx+c \\right)\\,dx }{ \\displaystyle \\int_{0}^{1} \\left(   x^2+x+1 \\right)\\,dx } = \\frac{ \\displaystyle \\frac{a}{3}+\\frac{b}{2}+c }{ \\displaystyle \\frac{11}{6} } = \\frac{2a+3b+6c}{11}',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          "\\left\\{ \\begin{array}{l} \\displaystyle f(x)=x^3-3ax^2+\\left(a^2+2a\\right)x-1 \\\\[0.8em] \\displaystyle f\'(x)=3x^2-6ax+\\left(a^2+2a\\right) \\\\[0.8em] \\displaystyle f\'(\\alpha)=0,\\quad f\'(\\beta)=0,\\quad \\alpha<\\beta \\\\[0.8em] \\displaystyle \\int_{\\alpha}^{\\beta} f\'(x)\\,dx = f(\\beta)-f(\\alpha) \\\\[0.8em] \\displaystyle \\left|f(\\alpha)\\right|+\\left|f(\\beta)\\right|=10 \\end{array} \\right.",
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\left\\{ \\begin{array}{l} \\displaystyle a_1=1,\\qquad a_{n+1}=a_n+2n+1 \\\\[0.8em] \\displaystyle S_n=\\sum_{k=1}^{n}a_k \\\\[0.8em] \\displaystyle S_n = \\sum_{k=1}^{n} \\left( 1+\\sum_{j=1}^{k-1}(2j+1) \\right) \\\\[0.8em] \\displaystyle = \\sum_{k=1}^{n}k^2 = \\frac{n(n+1)(2n+1)}{6} \\end{array} \\right.',
                      },
                    },
                    { text: '  ', type: 'text' },
                    {
                      type: 'inlineMath',
                      attrs: {
                        latex:
                          '\\left\\{ \\begin{array}{l} \\displaystyle g(x)= \\left| x^2-4x+3 \\right| \\\\[0.8em] \\displaystyle \\int_{0}^{4}g(x)\\,dx = \\int_{0}^{1}(x^2-4x+3)\\,dx - \\int_{1}^{3}(x^2-4x+3)\\,dx + \\int_{3}^{4}(x^2-4x+3)\\,dx \\\\[0.8em] \\displaystyle = \\left[\\frac{x^3}{3}-2x^2+3x\\right]_{0}^{1} - \\left[\\frac{x^3}{3}-2x^2+3x\\right]_{1}^{3} + \\left[\\frac{x^3}{3}-2x^2+3x\\right]_{3}^{4} \\end{array} \\right.',
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        label: '다가오는 학습',
        highlighted: false,
        items: [
          {
            badges: [{ text: '집중학습', variant: 'green' }],
            title: {
              type: 'doc',
              content: [paragraph(text('어드민 헤드라인/권장 15글자/선택'))],
            },
            description: {
              type: 'doc',
              content: [
                paragraph(
                  text(
                    '어드민에 등록된 Title 영역입니다. 권장길이 공백 포함 26~38자, 최대 공백포함 60자.'
                  )
                ),
              ],
            },
            content: {
              type: 'doc',
              content: [
                paragraph(
                  text(
                    'asdfasdfasdfsadfasdfasdfaasdfasdfasdfasdfsadfsdfsdfsdfsdfsdfdsfdsfsdfsdfsdfsdfdssdfsdfsdfasdfasdfasdfsadfasdfasdfaasdfasdfasdfasdfsadfsdfsdfsdfsdfsdfdsfdsfsdfsdfsdfsdfdssdfsdfsdfasdfasdfasdfsadfasdfasdfaasdfasdfasdfasdfsadfsdfsdfsdfsdfsdfdsfdsfsdfsdfsdfsdfdssdfsdfsdf'
                  )
                ),
              ],
            },
          },
          {
            badges: [{ text: '집중학습', variant: 'green' }],
            title: {
              type: 'doc',
              content: [paragraph(text('어드민 헤드라인/권장 15글자/선택'))],
            },
            description: {
              type: 'doc',
              content: [
                paragraph(
                  text(
                    '어드민에 등록된 Title 영역입니다. 권장길이 공백 포함 26~38자, 최대 공백포함 60자.'
                  )
                ),
              ],
            },
            content: {
              type: 'doc',
              content: [
                paragraph(
                  text(
                    'asdfasdfasdfsadfasdfasdfaasdfasdfasdfasdfsadfsdfsdfsdfsdfsdfdsfdsfsdfsdfsdfsdfdssdfsdfsdfasdfasdfasdfsadfasdfasdfaasdfasdfasdfasdfsadfsdfsdfsdfsdfsdfdsfdsfsdfsdfsdfsdfdssdfsdfsdfasdfasdfasdfsadfasdfasdfaasdfasdfasdfasdfsadfsdfsdfsdfsdfsdfdsfdsfsdfsdfsdfsdfdssdfsdfsdf'
                  )
                ),
              ],
            },
          },
        ],
      },
    ],
  },
];

export const mockHomeName = '테스트';
