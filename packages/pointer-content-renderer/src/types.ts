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
    };

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
