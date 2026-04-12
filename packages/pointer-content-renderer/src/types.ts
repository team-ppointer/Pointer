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
    }
  | { type: 'init'; mode: 'chat'; scenario: ChatScenario }
  | { type: 'init'; mode: 'overview'; sections: OverviewSection[] }
  | { type: 'bookmarkResult'; sectionId: string; success: boolean }
  | { type: 'scrollToSection'; sectionId: string };

// ── Bridge messages: WebView → RN ──

export type WebViewToRNMessage =
  | { type: 'ready'; mode: ContentMode }
  | { type: 'height'; value: number }
  | { type: 'complete'; answers: UserAnswer[] }
  | { type: 'visibleSection'; sectionId: string }
  | { type: 'bookmark'; sectionId: string; bookmarked: boolean };

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
  questionResponse: 'yes' | 'no';
  confirmResponse: 'yes' | 'no';
}

// ── Overview sections ──

export interface OverviewSection {
  id: string;
  label?: string;
  display:
    | {
        type: 'card';
        variant: 'default' | 'pointing';
        content: JSONNode;
        bookmarkable?: boolean;
        bookmarked?: boolean;
      }
    | { type: 'plain'; content: JSONNode; collapsible?: boolean }
    | { type: 'chat'; scenario: ChatScenario; userAnswers?: UserAnswer[] }
    | { type: 'divider'; text: string };
}
