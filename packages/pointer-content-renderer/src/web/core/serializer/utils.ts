import type { JSONMark } from '../../../types';

/**
 * Parse an unknown attr value as a positive integer within a safe range.
 * Returns `fallback` for invalid or out-of-range inputs.
 */
export function safePositiveInt(
  value: unknown,
  fallback: number,
  { min = 1, max = 1000 }: { min?: number; max?: number } = {}
): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const int = Math.floor(n);
  if (int < min || int > max) return fallback;
  return int;
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, '&quot;');
}

export function areAttrsEqual(a?: Record<string, unknown>, b?: Record<string, unknown>): boolean {
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

export function areMarksEqual(m1: JSONMark[] = [], m2: JSONMark[] = []): boolean {
  if (m1.length !== m2.length) return false;
  for (let i = 0; i < m1.length; i++) {
    if (m1[i].type !== m2[i].type) return false;
    if (!areAttrsEqual(m1[i].attrs, m2[i].attrs)) return false;
  }
  return true;
}
