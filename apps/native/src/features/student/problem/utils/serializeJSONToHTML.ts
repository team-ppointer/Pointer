type JSONMark = {
  type: string;
  attrs?: Record<string, any>;
};

type JSONNode = {
  type: string;
  attrs?: Record<string, any>;
  content?: JSONNode[];
  text?: string;
  marks?: JSONMark[];
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, '&quot;');
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
        const escColor = escapeAttr(color);
        return `<mark data-color="${escColor}" style="background-color: ${escColor}; color: inherit;">${acc}</mark>`;
      }
      default:
        return acc;
    }
  }, text);
}

function serializeImage(node: JSONNode): string {
  const attrs = node.attrs ?? {};
  const src = attrs.src ?? '';
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

function serializeInline(node: JSONNode): string {
  if (node.type === 'text') {
    const text = escapeHtml(node.text ?? '');
    return renderMarks(text, node.marks);
  }

  if (node.type === 'inlineMath') {
    const latex = node.attrs?.latex ?? '';
    return `<span data-latex="${escapeAttr(latex)}" data-type="inline-math"></span>`;
  }

  if (node.type === 'image') {
    return serializeImage(node);
  }

  const children = (node.content ?? []).map(serializeInline).join('');
  return children;
}

function serializeParagraph(node: JSONNode): string {
  const inner = (node.content ?? []).map(serializeInline).join('');
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

  const typeAttr = type ? ` type="${escapeAttr(type)}"` : '';
  const startAttr = start !== 1 ? ` start="${start}"` : '';

  const items = (node.content ?? []).map(serializeListItem).join('');

  return `<ol${startAttr}${typeAttr}>${items}</ol>`;
}

function countTableColumns(row: JSONNode): number {
  return (row.content ?? []).reduce((sum, cell) => {
    const colspan = cell.attrs?.colspan ?? 1;
    return sum + colspan;
  }, 0);
}

function serializeTable(node: JSONNode): string {
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
          const colspan = cell.attrs?.colspan ?? 1;
          const rowspan = cell.attrs?.rowspan ?? 1;
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
      return serializeInline(node);
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
