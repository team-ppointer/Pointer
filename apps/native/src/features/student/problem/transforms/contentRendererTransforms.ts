/**
 * ContentRenderer 입력 데이터(서버 스키마)를 `@repo/pointer-content-renderer` 의
 * `ContentWebView` init 메시지 / 섹션 데이터로 변환하는 순수 함수들.
 *
 * 화면별 어댑터 역할. 부수효과 없음.
 */
import type {
  ChatScenario,
  JSONNode,
  OverviewSection,
  PointingData,
  PointingNode,
  RNToWebViewMessage,
  UserAnswer,
} from '@repo/pointer-content-renderer';

import type { components } from '@schema';

type PointingWithFeedbackResp = components['schemas']['PointingWithFeedbackResp'];
type ProblemWithStudyInfoResp = components['schemas']['ProblemWithStudyInfoResp'];
type PublishProblemGroupResp = components['schemas']['PublishProblemGroupResp'];
type PointingBubbleResp = components['schemas']['PointingBubbleResp'];

// ── Shared types ────────────────────────────────────────────────────

/**
 * 서버에 아직 반영되지 않은 포인팅 응답(큐 내 pending entry). MAT-275 의
 * `PointingQueueEntry` 는 이 인터페이스를 구조적으로 만족한다.
 */
export interface PendingPointingAnswer {
  pointingId: number;
  step: 'question' | 'confirm';
  value: boolean;
}

/**
 * child0 → child1 → ... → main 순서로 flatten 된 pointing 과
 * subtitle 구성에 쓰일 parent 표시 번호.
 */
export interface JoinedPointing {
  pointing: PointingWithFeedbackResp;
  /** 화면 표시용 parent 번호 (예: main → "1", main 1 의 child 0 → "1-1"). */
  parentProblemDisplayNo: string;
}

// ── JSON parsing ────────────────────────────────────────────────────

const EMPTY_DOC: JSONNode = { type: 'doc', content: [] };

/**
 * 서버의 JSON string 을 안전하게 `JSONNode` 로 파싱. 실패/빈 입력 시
 * `{ type: 'doc', content: [] }` 반환 (절대 throw 하지 않음).
 */
export function parseTipTapDoc(raw?: string | null): JSONNode {
  if (raw == null || raw === '') return EMPTY_DOC;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed != null &&
      typeof parsed === 'object' &&
      'type' in parsed &&
      typeof (parsed as { type: unknown }).type === 'string'
    ) {
      return parsed as JSONNode;
    }
    return EMPTY_DOC;
  } catch {
    return EMPTY_DOC;
  }
}

// ── Chat scenario construction ──────────────────────────────────────

/** paragraph 이면서 content 가 비었거나 모든 text 가 공백뿐인 경우 true. */
function isEmptyParagraph(node: JSONNode): boolean {
  if (node.type !== 'paragraph') return false;
  const children = node.content ?? [];
  if (children.length === 0) return true;
  return children.every((c) => c.type === 'text' && (c.text == null || c.text.trim() === ''));
}

/**
 * question 은 통째로 단일 버블.
 * (현재 서버 스키마상 questionContent 전체를 한 말풍선으로 보여주는 기획)
 */
export function toQuestionNodes(questionContent: string): PointingNode[] {
  return [{ contentNode: parseTipTapDoc(questionContent) }];
}

/**
 * `bubbles[]` 를 `PointingNode[]` 로 변환. `no` 오름차순 정렬(BE-3: 순서 섞일 수 있음).
 * `includeExpand: true` 이면 expand 관련 3 필드(nodeId/defaultExpanded/expandContent) 포함.
 * `includeExpand: false` 이면 expand 필드 전부 omit — renderer 가 `?` 버튼 자체를 렌더하지 않음(PD-3).
 */
export function toBubbleNodes(args: {
  bubbles: PointingBubbleResp[];
  pressedBubbleIds: Set<number>;
  includeExpand: boolean;
}): PointingNode[] {
  const { bubbles, pressedBubbleIds, includeExpand } = args;
  return [...bubbles]
    .sort((a, b) => a.no - b.no)
    .map((bubble) => {
      const contentNode = parseTipTapDoc(bubble.contentJson);
      if (!includeExpand) {
        return { contentNode };
      }
      return {
        contentNode,
        nodeId: String(bubble.id),
        defaultExpanded: bubble.isQuestionPressed === true || pressedBubbleIds.has(bubble.id),
        ...(bubble.extendContent ? { expandContent: parseTipTapDoc(bubble.extendContent) } : {}),
      };
    });
}

/**
 * answer 는 `bubbles[]` 우선 사용. 비어있거나 undefined 이면 `commentContent` top-level
 * node 단위로 분해(legacy fallback). 빈 paragraph 는 필터링.
 * 각 자식은 `{ type: 'doc', content: [child] }` 로 래핑해 단일 버블용 doc 형태로.
 */
export function toAnswerNodes(args: {
  bubbles?: PointingBubbleResp[];
  commentContent: string;
  pressedBubbleIds: Set<number>;
  includeExpand: boolean;
}): PointingNode[] {
  const { bubbles, commentContent, pressedBubbleIds, includeExpand } = args;
  if (bubbles && bubbles.length > 0) {
    return toBubbleNodes({ bubbles, pressedBubbleIds, includeExpand });
  }
  // TODO(MAT-649): drop fallback when server removes commentContent. Single revertable commit.
  const doc = parseTipTapDoc(commentContent);
  const children = doc.content ?? [];
  return children
    .filter((c) => !isEmptyParagraph(c))
    .map((c) => ({ contentNode: { type: 'doc', content: [c] } }));
}

export function toPointingData(
  pointing: PointingWithFeedbackResp,
  label: string,
  pressedBubbleIds: Set<number>,
  includeExpand: boolean
): PointingData {
  return {
    id: String(pointing.id),
    label,
    questionNodes: toQuestionNodes(pointing.questionContent),
    answerNodes: toAnswerNodes({
      bubbles: pointing.bubbles,
      commentContent: pointing.commentContent,
      pressedBubbleIds,
      includeExpand,
    }),
  };
}

export function toChatScenario(
  pointings: PointingWithFeedbackResp[],
  pressedBubbleIds: Set<number>,
  includeExpand: boolean
): ChatScenario {
  return {
    pointings: pointings.map((p, i) =>
      toPointingData(p, `${i + 1}번째 포인팅`, pressedBubbleIds, includeExpand)
    ),
  };
}

// ── UserAnswers (server state + pending queue merge) ────────────────

function booleanToYesNo(v: boolean): 'yes' | 'no' {
  return v ? 'yes' : 'no';
}

/** queue 값이 있으면 서버값보다 우선(= optimistic UI 일관성). 없으면 서버값. 둘 다 없으면 undefined. */
function resolveResponse(
  serverValue: boolean | null | undefined,
  queueValue: boolean | undefined
): 'yes' | 'no' | undefined {
  if (queueValue !== undefined) return booleanToYesNo(queueValue);
  if (serverValue == null) return undefined;
  return booleanToYesNo(serverValue);
}

/**
 * 서버 상태(`isQuestionUnderstood` / `isCommentUnderstood`)와 큐 내 pending
 * entries 를 merge 해 `UserAnswer[]` 생성. chat WebView 의 resume 렌더링에 사용.
 */
export function toUserAnswers(
  pointings: PointingWithFeedbackResp[],
  pendingQueueEntries: PendingPointingAnswer[] = []
): UserAnswer[] {
  return pointings.map((p) => {
    const queuedQ = pendingQueueEntries.find((e) => e.pointingId === p.id && e.step === 'question');
    const queuedC = pendingQueueEntries.find((e) => e.pointingId === p.id && e.step === 'confirm');
    const questionResponse = resolveResponse(p.isQuestionUnderstood, queuedQ?.value);
    const confirmResponse = resolveResponse(p.isCommentUnderstood, queuedC?.value);
    return {
      pointingId: String(p.id),
      ...(questionResponse !== undefined && { questionResponse }),
      ...(confirmResponse !== undefined && { confirmResponse }),
    };
  });
}

// ── Flatten pointings for Analysis / AllPointings right pane ────────

/**
 * child0 → child1 → ... → lastChild → main 순서로 pointing 을 flatten.
 * 각 pointing 옆에 parent 의 표시 번호(`parentProblemDisplayNo`)를 함께 반환.
 */
export function joinPointingsForAnalysis(group: PublishProblemGroupResp): JoinedPointing[] {
  const main = group.problem;
  const children = group.childProblems ?? [];
  const mainNoDisplay = main.no != null ? String(main.no) : '1';
  const result: JoinedPointing[] = [];

  children.forEach((child, idx) => {
    const childNoDisplay = `${mainNoDisplay}-${idx + 1}`;
    for (const pointing of child.pointings ?? []) {
      result.push({ pointing, parentProblemDisplayNo: childNoDisplay });
    }
  });
  for (const pointing of main.pointings ?? []) {
    result.push({ pointing, parentProblemDisplayNo: mainNoDisplay });
  }
  return result;
}

// ── Document init message ───────────────────────────────────────────

export type DocumentInitMessage = Extract<RNToWebViewMessage, { type: 'init'; mode: 'document' }>;

export function buildDocumentInit(opts: {
  content: string;
  fontStyle?: 'sans-serif' | 'serif';
  padding?: number;
  backgroundColor?: string;
}): DocumentInitMessage {
  return {
    type: 'init',
    mode: 'document',
    content: parseTipTapDoc(opts.content),
    ...(opts.fontStyle !== undefined && { fontStyle: opts.fontStyle }),
    ...(opts.padding !== undefined && { padding: opts.padding }),
    ...(opts.backgroundColor !== undefined && { backgroundColor: opts.backgroundColor }),
  };
}

// ── AnalysisScreen overview sections ────────────────────────────────

/**
 * 탭/카드 섹션 배열 생성. 해설(`solutionContent`) 섹션은 서버 전용 필드가
 * 도입되기 전까지 생략. bookmark 미노출(AnalysisScreen scrap UI 제거됨).
 */
export function buildAnalysisOverviewSections(opts: {
  problem: ProblemWithStudyInfoResp;
  joined: JoinedPointing[];
  pendingQueueEntries?: PendingPointingAnswer[];
  pressedBubbleIds: Set<number>;
  includeExpand: boolean;
}): OverviewSection[] {
  const { problem, joined, pendingQueueEntries = [], pressedBubbleIds, includeExpand } = opts;
  const sections: OverviewSection[] = [];

  if (problem.readingTipContent) {
    sections.push({
      id: 'reading',
      tabLabel: '문항 읽어내려갈 때',
      display: {
        type: 'card',
        variant: 'default',
        displayLabel: '문항 읽어내려갈 때',
        content: parseTipTapDoc(problem.readingTipContent),
      },
    });
  }

  if (problem.oneStepMoreContent) {
    sections.push({
      id: 'one-step-more',
      tabLabel: '한걸음 더',
      display: {
        type: 'card',
        variant: 'default',
        displayLabel: '한걸음 더',
        content: parseTipTapDoc(problem.oneStepMoreContent),
      },
    });
  }

  joined.forEach(({ pointing }, i) => {
    const index = i + 1;
    sections.push({
      id: `pointing-divider-${i}`,
      tabLabel: `${index}번째 포인팅`,
      display: { type: 'divider', text: `${index}번째 포인팅` },
    });
    sections.push({
      id: `pointing-chat-${pointing.id}`,
      display: {
        type: 'chat',
        scenario: toChatScenario([pointing], pressedBubbleIds, includeExpand),
        userAnswers: toUserAnswers([pointing], pendingQueueEntries),
      },
    });
  });

  return sections;
}

// ── AllPointingsScreen left sections (main → child0 → child1 → ...) ─

export function buildAllPointingsLeftSections(group: PublishProblemGroupResp): OverviewSection[] {
  const sections: OverviewSection[] = [];
  const main = group.problem;
  const children = group.childProblems ?? [];
  const mainNoDisplay = main.no != null ? String(main.no) : '1';

  sections.push({
    id: `problem-${main.id}`,
    tabLabel: `문제 ${mainNoDisplay}번`,
    display: {
      type: 'plain',
      content: parseTipTapDoc(main.problemContent),
    },
  });

  if (children.length > 0) {
    sections.push({
      id: `divider-${main.id}`,
      display: {
        type: 'divider',
      },
    });
  }

  children.forEach((child, idx) => {
    sections.push({
      id: `problem-${child.id}`,
      tabLabel: `${mainNoDisplay}-${idx + 1}번`,
      display: {
        type: 'plain',
        content: parseTipTapDoc(child.problemContent),
      },
    });

    if (idx < children.length - 1) {
      sections.push({
        id: `divider-${child.id}`,
        display: {
          type: 'divider',
        },
      });
    }
  });

  return sections;
}

// ── AllPointings helpers ─────────────────────────────────────────────

/**
 * `bubbles[]` 의 각 `contentJson` content[] 를 평탄화해 단일 TipTap doc 을 생성.
 * AllPointingsScreen 우측 정적 요약 뷰용 — chat 의 `?` 인터랙션이 없는 뷰이므로
 * `extendContent` 는 의도적으로 포함하지 않음(사용자 결정 — A안, §3.I2).
 * `no` 오름차순 정렬(BE-3: 순서 섞일 수 있음).
 */
export function joinBubblesToDoc(bubbles: PointingBubbleResp[]): JSONNode {
  const sorted = [...bubbles].sort((a, b) => a.no - b.no);
  const content = sorted.flatMap((bubble) => parseTipTapDoc(bubble.contentJson).content ?? []);
  return { type: 'doc', content };
}

// ── AllPointingsScreen right sections (joined pointings + bookmark state) ──

export function buildAllPointingsRightSections(opts: {
  joined: JoinedPointing[];
  scrappedPointingIds: Set<number>;
}): OverviewSection[] {
  const { joined, scrappedPointingIds } = opts;
  return joined.map(({ pointing, parentProblemDisplayNo }, i) => {
    const index = i + 1;
    return {
      id: `pointing:${pointing.id}`,
      tabLabel: `${index}번째`,
      display: {
        type: 'card',
        variant: 'pointing',
        title: `${index}번째 포인팅`,
        subtitle: `${parentProblemDisplayNo}번`,
        question: parseTipTapDoc(pointing.questionContent),
        // TODO(MAT-649): drop fallback when server removes commentContent. Single revertable commit.
        answer:
          pointing.bubbles && pointing.bubbles.length > 0
            ? joinBubblesToDoc(pointing.bubbles)
            : parseTipTapDoc(pointing.commentContent),
        bookmarkable: true,
        bookmarked: scrappedPointingIds.has(pointing.id),
      },
    };
  });
}
