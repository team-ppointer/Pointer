import { serializeJSONToHTML } from '../../core/serializer/index';
import { renderMath } from '../../core/math-renderer';
import { sendToRN } from '../../bridge';
import type { JSONNode } from '../../../types';

export async function renderDocument(
  container: HTMLElement,
  options: {
    content: JSONNode;
    fontStyle?: 'sans-serif' | 'serif';
    backgroundColor?: string;
    padding?: number;
  },
  isCurrent: () => boolean
): Promise<(() => void) | null> {
  const fontFamily = options.fontStyle === 'sans-serif' ? undefined : '"KoPub Batang", serif';
  if (fontFamily) {
    document.documentElement.style.setProperty('--content-font-family', fontFamily);
  }

  if (options.backgroundColor) {
    document.body.style.backgroundColor = options.backgroundColor;
  }

  if (options.padding !== undefined) {
    document.documentElement.style.setProperty('--content-padding', `${options.padding}px`);
  }

  const docNode: JSONNode =
    options.content.type === 'doc' ? options.content : { type: 'doc', content: [options.content] };

  // Render into detached fragment to avoid stale mutation of live DOM
  const fragment = document.createElement('div');
  fragment.innerHTML = serializeJSONToHTML(docNode);
  await renderMath(fragment);
  if (!isCurrent()) return null;

  // Commit to live DOM
  container.append(...fragment.childNodes);

  // Height reporting — safe to set up, we verified isCurrent
  let debounceTimer: number | undefined;
  const observer = new ResizeObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      sendToRN({ type: 'height', value: container.offsetHeight });
    }, 100);
  });
  observer.observe(container);

  sendToRN({ type: 'height', value: container.offsetHeight });

  return () => {
    clearTimeout(debounceTimer);
    observer.disconnect();
  };
}
