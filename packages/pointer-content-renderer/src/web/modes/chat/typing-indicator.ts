import type { JSONNode } from '../../../types';
import { getTextLength, hasImageNode } from '../../core/text-length';

import { scrollToBottom } from './scroll';

export function getTypingTiming(node: JSONNode): { preDelay: number; duration: number } {
  const isImage = hasImageNode(node);
  if (isImage) return { preDelay: 400, duration: 1000 };

  const len = getTextLength(node);
  if (len <= 20) return { preDelay: 400, duration: 1000 };
  if (len <= 80) return { preDelay: 400, duration: 3000 };
  return { preDelay: 400, duration: 5000 };
}

export function getFixedTextTiming(text: string): { preDelay: number; duration: number } {
  const len = text.replace(/\s/g, '').length;
  if (len <= 20) return { preDelay: 400, duration: 1000 };
  if (len <= 80) return { preDelay: 400, duration: 3000 };
  return { preDelay: 400, duration: 5000 };
}

export function createTypingIndicator(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'chat-bubble chat-bubble--system typing-indicator';
  el.innerHTML =
    '<span class="typing-dots" aria-hidden="true"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>';
  return el;
}

export function showTypingIndicator(container: HTMLElement): HTMLElement {
  const indicator = createTypingIndicator();
  container.appendChild(indicator);
  scrollToBottom();
  return indicator;
}

export function replaceWithBubble(indicator: HTMLElement, bubble: HTMLElement): void {
  indicator.replaceWith(bubble);
  scrollToBottom();
}

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal!.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
