const NEAR_BOTTOM_THRESHOLD = 100;
const SCROLL_ANIMATION_MS = 400;

let _stickyToBottom = true;
let _programmaticScroll = false;
let _programmaticTimer: number | undefined;
let _scrollListener: (() => void) | null = null;

function isNearBottom(): boolean {
  return window.innerHeight + window.scrollY >= document.body.scrollHeight - NEAR_BOTTOM_THRESHOLD;
}

function markProgrammatic(smooth: boolean): void {
  _programmaticScroll = true;
  clearTimeout(_programmaticTimer);
  _programmaticTimer = window.setTimeout(
    () => {
      _programmaticScroll = false;
    },
    smooth ? SCROLL_ANIMATION_MS : 50
  );
}

/**
 * Reset sticky state and (re)attach the scroll listener for a new chat
 * session. Idempotent — safe to call multiple times. Pair with
 * {@link destroyChatScroll} on chat teardown so subsequent re-entries
 * start from a clean state and the listener is not duplicated.
 */
export function initChatScroll(): void {
  destroyChatScroll();
  _stickyToBottom = true;
  _programmaticScroll = false;
  const listener = () => {
    if (_programmaticScroll) return;
    // User-initiated scroll: update sticky intent
    _stickyToBottom = isNearBottom();
  };
  _scrollListener = listener;
  window.addEventListener('scroll', listener, { passive: true });
}

/**
 * Detach the scroll listener and clear sticky/programmatic state. Called
 * when leaving chat mode so a later re-entry can {@link initChatScroll}
 * cleanly without inheriting stale "user scrolled away" intent.
 */
export function destroyChatScroll(): void {
  if (_scrollListener) {
    window.removeEventListener('scroll', _scrollListener);
    _scrollListener = null;
  }
  if (_programmaticTimer !== undefined) {
    clearTimeout(_programmaticTimer);
    _programmaticTimer = undefined;
  }
  _programmaticScroll = false;
  _stickyToBottom = true;
}

function ensureInitialized(): void {
  if (!_scrollListener) initChatScroll();
}

function doScroll(smooth: boolean): void {
  markProgrammatic(smooth);
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * Scroll to bottom only if user intends to stay at the bottom (sticky mode).
 * Call this after adding new content. Safe to call frequently.
 */
export function scrollToBottom(smooth = true): void {
  ensureInitialized();
  if (!_stickyToBottom) return;
  doScroll(smooth);
}

/**
 * Force scroll to bottom regardless of sticky state.
 * Use sparingly (e.g., initial load).
 */
export function forceScrollToBottom(smooth = true): void {
  ensureInitialized();
  _stickyToBottom = true;
  doScroll(smooth);
}
