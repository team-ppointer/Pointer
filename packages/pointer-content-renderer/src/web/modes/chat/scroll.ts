export function scrollToBottom(smooth = true): void {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: smooth ? 'smooth' : 'instant',
  });
}
