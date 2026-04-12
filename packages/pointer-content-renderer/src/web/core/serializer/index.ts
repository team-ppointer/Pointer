import type { JSONNode } from '../../../types';
import { serializeInlineList } from './inline';
import {
  serializeParagraph,
  serializeBulletList,
  serializeOrderedList,
  serializeListItem,
  serializeBlockquote,
  serializeTable,
  serializeHorizontalRule,
  serializeImage,
  setSerializeNode,
} from './nodes';

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
    case 'hardBreak':
      return '<br>';
    case 'text':
    case 'inlineMath':
      return serializeInlineList([node]);
    default: {
      const inner = (node.content ?? []).map(serializeNode).join('');
      return inner;
    }
  }
}

// Wire up the forward reference for nodes.ts
setSerializeNode(serializeNode);

export function serializeJSONToHTML(doc: JSONNode | string): string {
  let json: JSONNode;
  if (typeof doc === 'string') json = JSON.parse(doc);
  else json = doc;

  if (json.type !== 'doc') {
    throw new Error('root node must be type=doc');
  }
  return (json.content ?? []).map(serializeNode).join('');
}

export function serializeNodeToHTML(node: JSONNode): string {
  return serializeNode(node);
}
