import type { JSONNode } from '../../../types';
import { safePositiveInt } from './utils';
import { serializeInlineList, serializeImage } from './inline';

const ORDERED_LIST_TYPES = new Set(['1', 'a', 'A', 'i', 'I']);

// Forward declaration — will be set by index.ts to break circular dependency
let _serializeNode: (node: JSONNode) => string;
export function setSerializeNode(fn: (node: JSONNode) => string): void {
  _serializeNode = fn;
}

export function serializeParagraph(node: JSONNode): string {
  const inner = serializeInlineList(node.content ?? []);
  return `<p>${inner}</p>`;
}

export function serializeListItem(node: JSONNode): string {
  const inner = (node.content ?? []).map((n) => _serializeNode(n)).join('');
  return `<li>${inner}</li>`;
}

export function serializeBulletList(node: JSONNode): string {
  const items = (node.content ?? []).map(serializeListItem).join('');
  return `<ul>${items}</ul>`;
}

export function serializeOrderedList(node: JSONNode): string {
  const attrs = node.attrs ?? {};
  const start = safePositiveInt(attrs.start, 1, { min: 1, max: 9999 });
  const typeRaw = attrs.type != null ? String(attrs.type) : '';
  const type = ORDERED_LIST_TYPES.has(typeRaw) ? typeRaw : '';

  const typeAttr = type ? ` type="${type}"` : '';
  const startAttr = start !== 1 ? ` start="${start}"` : '';

  const items = (node.content ?? []).map(serializeListItem).join('');

  return `<ol${startAttr}${typeAttr}>${items}</ol>`;
}

function countTableColumns(row: JSONNode): number {
  return (row.content ?? []).reduce((sum, cell) => {
    return sum + safePositiveInt(cell.attrs?.colspan, 1, { min: 1, max: 1000 });
  }, 0);
}

export function serializeTable(node: JSONNode): string {
  const rows = node.content ?? [];
  const firstRow = rows[0];
  const cols = firstRow ? countTableColumns(firstRow) : 1;
  const minWidth = cols * 25;

  const colgroup = `<colgroup>${Array.from({ length: cols })
    .map(() => `<col style="min-width: 25px;"></col>`)
    .join('')}</colgroup>`;

  const body = rows
    .map((row) => {
      const cells = (row.content ?? [])
        .map((cell) => {
          const colspan = safePositiveInt(cell.attrs?.colspan, 1, { min: 1, max: 1000 });
          const rowspan = safePositiveInt(cell.attrs?.rowspan, 1, { min: 1, max: 1000 });
          const colSpanAttr = ` colspan="${colspan}"`;
          const rowSpanAttr = ` rowspan="${rowspan}"`;

          const cellInner = (cell.content ?? [])
            .map((n) => {
              if (n.type === 'paragraph') return serializeParagraph(n);
              return _serializeNode(n);
            })
            .join('');

          return `<td${colSpanAttr}${rowSpanAttr}>${cellInner}</td>`;
        })
        .join('');

      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<table style="min-width: ${minWidth}px;">${colgroup}<tbody>${body}</tbody></table>`;
}

export function serializeBlockquote(node: JSONNode): string {
  const inner = (node.content ?? []).map((n) => _serializeNode(n)).join('');
  return `<blockquote>${inner}</blockquote>`;
}

export function serializeHorizontalRule(): string {
  return `<div data-type="horizontalRule"><hr></div>`;
}

export { serializeImage };
