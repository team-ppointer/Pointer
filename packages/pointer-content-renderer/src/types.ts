// ── JSON Node types (TipTap) ──

export type JSONMark = { type: string; attrs?: Record<string, unknown> };

export type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
  text?: string;
  marks?: JSONMark[];
};

// ── Content modes ──

export type ContentMode = 'document' | 'chat' | 'overview' | 'home';

// ── Bridge messages: RN → WebView ──

export type RNToWebViewMessage =
  | {
      type: 'init';
      mode: 'document';
      content: JSONNode;
      fontStyle?: 'sans-serif' | 'serif';
      backgroundColor?: string;
      /** Inner content padding in px */
      padding?: number;
    }
  | {
      type: 'init';
      mode: 'chat';
      scenario: ChatScenario;
      /** Previously saved answers for resume. Fields may be partial. */
      userAnswers?: UserAnswer[];
      /** Text prompt shown in the advance button bubble. Defaults to '다음으로 이동할까요?'. */
      advanceMessage?: string;
      /** Label for the advance button shown after the last pointing completes. Defaults to '다음'. */
      advanceButtonLabel?: string;
    }
  | {
      type: 'init';
      mode: 'overview';
      variant?: 'summary' | 'pointing';
      sections: OverviewSection[];
    }
  | {
      type: 'init';
      mode: 'home';
      cards: HomeCard[];
    }
  | {
      type: 'bookmarkResult';
      sectionId: string;
      /** Echo of the target state from the originating bookmark request */
      bookmarked: boolean;
      /** Echo of the requestId from the originating bookmark request */
      requestId: number;
      success: boolean;
    }
  | {
      type: 'scrollToSection';
      sectionId: string;
    };

// ── Bridge messages: WebView → RN ──

export type WebViewToRNMessage =
  | { type: 'bridgeReady' }
  | { type: 'ready'; mode: ContentMode }
  | { type: 'height'; value: number }
  | { type: 'complete'; answers: UserAnswer[] }
  | {
      /** Fire-and-forget per-step answer event emitted as soon as the user selects. */
      type: 'answer';
      pointingId: string;
      step: 'question' | 'confirm';
      response: 'yes' | 'no';
    }
  | {
      type: 'bookmark';
      sectionId: string;
      bookmarked: boolean;
      /** Monotonically increasing per-session id used to deduplicate stale results */
      requestId: number;
    }
  | {
      /** Fire-and-forget event emitted when a chat bubble's `?` (expand) button transitions from closed to open. RN enqueues to bubbleQuestionPressQueue. */
      type: 'bubbleQuestionPress';
      bubbleId: string;
    }
  | { type: 'advance' };

// ── Chat: Pointing structures ──

export interface ChatScenario {
  pointings: PointingData[];
}

export interface PointingData {
  id: string;
  label: string;
  questionNodes: PointingNode[];
  answerNodes: PointingNode[];
}

export interface PointingNode {
  contentNode: JSONNode;
  expandContent?: JSONNode;
  /** Stable per-bubble identifier. The renderer attaches it to the `?` button so a bridge `bubbleQuestionPress` event can carry it back to RN. Optional — legacy commentContent-derived nodes have no id. */
  nodeId?: string;
  /** When true, the bubble renders with its expand area pre-opened (and its `?` button disabled) on mount — used for resume of previously-pressed buttons. */
  defaultExpanded?: boolean;
}

export interface UserAnswer {
  pointingId: string;
  /** Optional to support partial resume (only question answered, confirm pending) */
  questionResponse?: 'yes' | 'no';
  /** Optional to support partial resume. Populated when the pointing is fully complete. */
  confirmResponse?: 'yes' | 'no';
}

// ── Overview sections ──

export interface OverviewSection {
  id: string;
  tabLabel?: string;
  display:
    | {
        type: 'card';
        variant: 'default';
        content: JSONNode;
        displayLabel?: string;
      }
    | {
        type: 'card';
        variant: 'pointing';
        title: string;
        subtitle: string;
        question: JSONNode;
        answer: JSONNode;
        bookmarkable?: boolean;
        bookmarked?: boolean;
      }
    | {
        type: 'card';
        variant: 'collapsible';
        title: string;
        content: JSONNode;
      }
    | { type: 'plain'; content: JSONNode }
    | { type: 'chat'; scenario: ChatScenario; userAnswers?: UserAnswer[] }
    | { type: 'divider'; text?: string };
}

// ── Home card types ──

export type HomeCard = HomeCommentCard | HomeStudySummaryCard;

export interface HomeCommentCard {
  type: 'comment';
  /** 카드 헤더 타이틀 (예: "{이름}님을 위한 1:1 코멘트") */
  title: string;
  /** 카드 부제 */
  subtitle: string;
  /** 만료 시각 (epoch ms). `null` 이면 시간 뱃지를 표시하지 않음. */
  expiryAt: number | null;
  content: JSONNode;
}

export interface HomeStudySummaryCard {
  type: 'study-summary';
  /** 카드 헤더 타이틀 (primary 색상) */
  title: string;
  /** 카드 부제. 줄바꿈은 '\n'. */
  subtitle: string;
  groups: HomeStudyGroup[];
}

export interface HomeStudyGroup {
  label: string;
  /** true = 파란 채워진 도트, false/undefined = 회색 빈 도트 */
  highlighted?: boolean;
  items: HomeStudyItem[];
}

export interface HomeStudyItem {
  badges: HomeStudyBadge[];
  /** LaTeX 포함 가능한 TipTap JSON */
  title: JSONNode;
  description: JSONNode;
  content: JSONNode;
}

export interface HomeStudyBadge {
  text: string;
  variant: 'orange' | 'green' | 'purple' | 'pink' | 'blue';
}
