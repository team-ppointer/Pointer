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
  return escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const HIGHLIGHT_COLOR_VAR_RE = /^var\(--tt-color-highlight-[a-z][a-z0-9-]*\)$/;

/**
 * highlight mark 의 색상 값으로 허용할 형식.
 * 콘텐츠는 항상 `var(--tt-color-highlight-<name>)` 으로 들어오며,
 * 실제 색상은 CSS 변수에서 결정된다. `;` `:` 등 CSS 문장 주입 시도를
 * 차단하기 위해 형식 자체를 좁힌다.
 */
export function isSafeHighlightColor(value: string): boolean {
  if (value.length > 64) return false;
  return HIGHLIGHT_COLOR_VAR_RE.test(value);
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
