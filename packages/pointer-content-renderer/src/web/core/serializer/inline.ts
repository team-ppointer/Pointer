import type { JSONMark, JSONNode } from '../../../types';
import { escapeHtml, escapeAttr, areMarksEqual } from './utils';
import { renderMarks } from './marks';

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
    alt,
  )}" title="${escapeAttr(title)}"${widthAttr}${heightAttr}>`;
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

export function serializeInlineList(nodes: JSONNode[]): string {
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

export { serializeImage };
