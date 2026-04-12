// ---------------------------------------------------------------------------
// TextBox data model
// ---------------------------------------------------------------------------

export type TextBoxData = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Computed from Skia Paragraph layout. */
  readonly height: number;
  readonly text: string;
  readonly fontSize: number;
  readonly color: string;
};

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_TEXTBOX_WIDTH = 200;
export const DEFAULT_TEXTBOX_FONT_SIZE = 16;
export const DEFAULT_TEXTBOX_COLOR = "#1E1E21";

// ---------------------------------------------------------------------------
// TextBox interaction state
// ---------------------------------------------------------------------------

export type TextBoxState = {
  readonly textBoxes: TextBoxData[];
  /** TextBox currently being edited (TextInput visible). */
  readonly editingId: string | null;
  /** TextBox currently selected (delete toolbar visible). */
  readonly selectedId: string | null;
};
