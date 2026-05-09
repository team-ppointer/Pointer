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

export type ContentMode = 'document' | 'chat' | 'overview';

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
