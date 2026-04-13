const NEAR_BOTTOM_THRESHOLD = 100;
const SCROLL_ANIMATION_MS = 400;

let _stickyToBottom = true;
let _programmaticScroll = false;
let _programmaticTimer: number | undefined;
let _initialized = false;

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

function initScrollTracking(): void {
  if (_initialized) return;
  _initialized = true;

  window.addEventListener(
    'scroll',
    () => {
      if (_programmaticScroll) return;
      // User-initiated scroll: update sticky intent
      _stickyToBottom = isNearBottom();
    },
    { passive: true }
  );
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
  initScrollTracking();
  if (!_stickyToBottom) return;
  doScroll(smooth);
}

/**
 * Force scroll to bottom regardless of sticky state.
 * Use sparingly (e.g., initial load).
 */
export function forceScrollToBottom(smooth = true): void {
  initScrollTracking();
  _stickyToBottom = true;
  doScroll(smooth);
}
