type JSONMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
  text?: string;
  marks?: JSONMark[];
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const HIGHLIGHT_COLOR_VAR_RE = /^var\(--tt-color-highlight-[a-z][a-z0-9-]*\)$/;

function isSafeHighlightColor(value: string): boolean {
  if (value.length > 64) return false;
  return HIGHLIGHT_COLOR_VAR_RE.test(value);
}

function toSafeSpan(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1 || n > 1000) return 1;
  return n;
}

function renderMarks(text: string, marks?: JSONMark[]): string {
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

function serializeImage(node: JSONNode): string {
  const attrs = node.attrs ?? {};
  const src = String(attrs.src ?? '');
  const altRaw = (attrs.alt ?? '').toString().trim();
  const titleRaw = (attrs.title ?? '').toString().trim();

  const alt = altRaw || 'unnamed';
  const title = titleRaw || 'unnamed';

  const widthRaw = (attrs.width ?? '').toString().trim();
  const heightRaw = (attrs.height ?? '').toString().trim();

  const widthAttr = widthRaw ? ` width="${escapeAttr(widthRaw)}"` : '';
  const heightAttr = heightRaw ? ` height="${escapeAttr(heightRaw)}"` : '';

  return `<img src="${escapeAttr(src)}" alt="${escapeAttr(
    alt
  )}" title="${escapeAttr(title)}"${widthAttr}${heightAttr}>`;
}

function areAttrsEqual(a?: Record<string, unknown>, b?: Record<string, unknown>): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (key !== keysB[i]) return false;
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function areMarksEqual(m1: JSONMark[] = [], m2: JSONMark[] = []): boolean {
  if (m1.length !== m2.length) return false;
  for (let i = 0; i < m1.length; i++) {
    if (m1[i].type !== m2[i].type) return false;
    if (!areAttrsEqual(m1[i].attrs, m2[i].attrs)) return false;
  }
  return true;
}

function getInlineNodeContent(node: JSONNode): string {
  if (node.type === 'text') {
    return escapeHtml(node.text ?? '');
  }
  if (node.type === 'inlineMath') {
    const latex = String(node.attrs?.latex ?? '');
    return `<span data-latex="${escapeAttr(latex)}" data-type="inline-math"></span>`;
  }
  if (node.type === 'image') {
    return serializeImage(node);
  }

  return serializeInlineList(node.content ?? []);
}

function serializeInlineList(nodes: JSONNode[]): string {
  if (nodes.length === 0) return '';

  const groups: { marks: JSONMark[]; content: string }[] = [];

  for (const node of nodes) {
    const nodeMarks = node.marks ?? [];
    const nodeContent = getInlineNodeContent(node);

    if (groups.length > 0) {
      const lastGroup = groups[groups.length - 1];
      if (areMarksEqual(lastGroup.marks, nodeMarks)) {
        lastGroup.content += nodeContent;
        continue;
      }
    }

    groups.push({ marks: nodeMarks, content: nodeContent });
  }

  return groups.map((g) => renderMarks(g.content, g.marks)).join('');
}

function serializeParagraph(node: JSONNode): string {
  const inner = serializeInlineList(node.content ?? []);
  return `<p>${inner}</p>`;
}

function serializeListItem(node: JSONNode): string {
  const inner = (node.content ?? []).map(serializeNode).join('');
  return `<li>${inner}</li>`;
}

function serializeBulletList(node: JSONNode): string {
  const items = (node.content ?? []).map(serializeListItem).join('');
  return `<ul>${items}</ul>`;
}

function serializeOrderedList(node: JSONNode): string {
  const attrs = node.attrs ?? {};
  const start = attrs.start ?? 1;
  const type = attrs.type ?? null;

  const typeAttr = type ? ` type="${escapeAttr(String(type))}"` : '';
  const startAttr = start !== 1 ? ` start="${start}"` : '';

  const items = (node.content ?? []).map(serializeListItem).join('');

  return `<ol${startAttr}${typeAttr}>${items}</ol>`;
}

const MAX_TABLE_COLS = 200;

function countTableColumns(row: JSONNode): number {
  return (row.content ?? []).reduce((sum, cell) => {
    const colspan = toSafeSpan(cell.attrs?.colspan);
    return sum + colspan;
  }, 0);
}

function serializeTable(node: JSONNode): string {
  const rows = node.content ?? [];
  const firstRow = rows[0];
  const cols = firstRow ? countTableColumns(firstRow) : 1;
  const safeCols = Math.min(Math.max(1, cols), MAX_TABLE_COLS);
  const minWidth = safeCols * 25;

  const colgroup = `<colgroup>${Array.from({ length: safeCols })
    .map(() => `<col style="min-width: 25px;"></col>`)
    .join('')}</colgroup>`;

  const body = rows
    .map((row) => {
      const cells = (row.content ?? [])
        .map((cell) => {
          const colspan = toSafeSpan(cell.attrs?.colspan);
          const rowspan = toSafeSpan(cell.attrs?.rowspan);
          const colSpanAttr = ` colspan="${colspan}"`;
          const rowSpanAttr = ` rowspan="${rowspan}"`;

          const cellInner = (cell.content ?? [])
            .map((n) => {
              if (n.type === 'paragraph') return serializeParagraph(n);
              return serializeNode(n);
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

function serializeBlockquote(node: JSONNode): string {
  const inner = (node.content ?? []).map(serializeNode).join('');
  return `<blockquote>${inner}</blockquote>`;
}

function serializeHorizontalRule(): string {
  return `<div data-type="horizontalRule"><hr></div>`;
}

function serializeNode(node: JSONNode): string {
  switch (node.type) {
    case 'paragraph':
      return serializeParagraph(node);
    case 'bulletList':
      return serializeBulletList(node);
    case 'orderedList':
      return serializeOrderedList(node);
    case 'listItem':
      return serializeListItem(node);
    case 'blockquote':
      return serializeBlockquote(node);
    case 'table':
      return serializeTable(node);
    case 'tableRow':
      return '';
    case 'tableCell':
      return '';
    case 'horizontalRule':
      return serializeHorizontalRule();
    case 'image':
      return serializeImage(node);
    case 'text':
    case 'inlineMath':
      return serializeInlineList([node]);
    default: {
      const inner = (node.content ?? []).map(serializeNode).join('');
      return inner;
    }
  }
}

export function serializeJSONToHTML(doc: JSONNode | string): string {
  let json: JSONNode;
  if (typeof doc === 'string') json = JSON.parse(doc);
  else json = doc;

  if (json.type !== 'doc') {
    throw new Error('root node must be type=doc');
  }
  return (json.content ?? []).map(serializeNode).join('');
}
