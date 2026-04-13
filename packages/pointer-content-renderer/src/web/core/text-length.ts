import type { JSONNode } from '../../types';

export function getTextLength(node: JSONNode): number {
  if (node.type === 'text') {
    return (node.text ?? '').replace(/\s/g, '').length;
  }
  if (node.type === 'inlineMath') return 0;
  return (node.content ?? []).reduce((sum, child) => sum + getTextLength(child), 0);
}

export function hasImageNode(node: JSONNode): boolean {
  if (node.type === 'image') return true;
  return (node.content ?? []).some(hasImageNode);
}
