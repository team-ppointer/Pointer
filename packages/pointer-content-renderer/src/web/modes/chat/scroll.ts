const NEAR_BOTTOM_THRESHOLD = 100;

function isNearBottom(): boolean {
  return (
    window.innerHeight + window.scrollY >=
    document.body.scrollHeight - NEAR_BOTTOM_THRESHOLD
  );
}

export function scrollToBottom(smooth = true): void {
  if (!isNearBottom()) return;

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: smooth ? 'smooth' : 'instant',
  });
}

export function forceScrollToBottom(smooth = true): void {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: smooth ? 'smooth' : 'instant',
  });
}
