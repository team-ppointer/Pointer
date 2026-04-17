import type { TextBoxData } from './textBoxTypes';
import {
  DEFAULT_TEXTBOX_WIDTH,
  DEFAULT_TEXTBOX_FONT_SIZE,
  DEFAULT_TEXTBOX_COLOR,
} from './textBoxTypes';

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

let counter = 0;

export function generateTextBoxId(): string {
  return `tb_${Date.now().toString(36)}_${(counter++).toString(36)}`;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createTextBox(x: number, y: number, color?: string): TextBoxData {
  return {
    id: generateTextBoxId(),
    x,
    y,
    width: DEFAULT_TEXTBOX_WIDTH,
    height: 0,
    text: '',
    fontSize: DEFAULT_TEXTBOX_FONT_SIZE,
    color: color ?? DEFAULT_TEXTBOX_COLOR,
  };
}

// ---------------------------------------------------------------------------
// Hit-test
// ---------------------------------------------------------------------------

/**
 * Returns the id of the TextBox at the given canvas coordinates,
 * or null if none is hit. Tests in reverse order (top-most first).
 */
export function hitTestTextBox(
  canvasX: number,
  canvasY: number,
  textBoxes: readonly TextBoxData[]
): string | null {
  for (let i = textBoxes.length - 1; i >= 0; i--) {
    const tb = textBoxes[i];
    const effectiveHeight = Math.max(tb.height, tb.fontSize * 1.5);
    if (
      canvasX >= tb.x &&
      canvasX <= tb.x + tb.width &&
      canvasY >= tb.y &&
      canvasY <= tb.y + effectiveHeight
    ) {
      return tb.id;
    }
  }
  return null;
}
