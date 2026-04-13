/**
 * Per-section bookmark state. Locks the button while a request is in-flight
 * so we don't have to deal with stale/out-of-order results at all.
 */

interface BookmarkState {
  /** Last server-confirmed state. Used to revert on failure. */
  confirmed: boolean;
  /** True while a request is in flight; UI ignores additional clicks. */
  pending: boolean;
  /** Echoed back to the result handler to make sure we revert correctly. */
  inFlightRequestId: number;
}

const states = new Map<string, BookmarkState>();
let nextRequestId = 1;

export function initBookmarkState(sectionId: string, confirmed: boolean): void {
  states.set(sectionId, { confirmed, pending: false, inFlightRequestId: 0 });
}

export function isPending(sectionId: string): boolean {
  return states.get(sectionId)?.pending ?? false;
}

/**
 * Mark a click as in-flight and return the issued requestId.
 * Returns null if a request is already pending — caller should ignore the click.
 */
export function startBookmarkRequest(sectionId: string): number | null {
  const s = states.get(sectionId);
  if (!s) return null;
  if (s.pending) return null;
  const id = nextRequestId++;
  s.pending = true;
  s.inFlightRequestId = id;
  return id;
}

export type BookmarkResultAction =
  | { kind: 'commit' }
  | { kind: 'revert'; revertTo: boolean }
  | { kind: 'noop' };

/** Apply the result of a bookmark request. */
export function applyBookmarkResult(
  sectionId: string,
  requestId: number,
  bookmarked: boolean,
  success: boolean,
): BookmarkResultAction {
  const s = states.get(sectionId);
  if (!s) return { kind: 'noop' };
  // Stale result (button was already unlocked or different request) — ignore.
  if (s.inFlightRequestId !== requestId) return { kind: 'noop' };

  s.pending = false;
  if (success) {
    s.confirmed = bookmarked;
    return { kind: 'commit' };
  }
  return { kind: 'revert', revertTo: s.confirmed };
}

export function clearBookmarkStates(): void {
  states.clear();
  nextRequestId = 1;
}
