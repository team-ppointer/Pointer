import type { JSONMark } from '../../../types';

import { escapeAttr, isSafeHighlightColor } from './utils';

export function renderMarks(text: string, marks?: JSONMark[]): string {
  if (!marks || marks.length === 0) return text;

  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case 'bold':
        return `<strong>${acc}</strong>`;
      case 'italic':
        return `<em>${acc}</em>`;
      case 'strike':
        return `<s>${acc}</s>`;
      case 'underline':
        return `<u>${acc}</u>`;
      case 'highlight': {
        const color = mark.attrs?.color;
        if (!color) return acc;
        const colorStr = String(color);
        if (!isSafeHighlightColor(colorStr)) return acc;
        const escColor = escapeAttr(colorStr);
        return `<mark data-color="${escColor}" style="background-color: ${escColor}; color: inherit;">${acc}</mark>`;
      }
      default:
        return acc;
    }
  }, text);
}
