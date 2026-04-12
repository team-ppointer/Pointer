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
  },
): Promise<void> {
  // Document mode defaults to KoPub Batang (serif)
  const fontFamily =
    options.fontStyle === 'sans-serif'
      ? undefined  // falls back to CSS default (Pretendard)
      : '"KoPub Batang", serif';
  if (fontFamily) {
    document.documentElement.style.setProperty('--content-font-family', fontFamily);
  }

  // Set background color
  if (options.backgroundColor) {
    document.body.style.backgroundColor = options.backgroundColor;
  }

  // Render HTML — normalize to a doc node if needed
  const docNode: JSONNode =
    options.content.type === 'doc'
      ? options.content
      : { type: 'doc', content: options.content.content ?? [] };

  container.innerHTML = serializeJSONToHTML(docNode);

  // Render math
  await renderMath(container);

  // Height reporting with ResizeObserver + debounce
  let debounceTimer: number | undefined;
  const observer = new ResizeObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      sendToRN({ type: 'height', value: container.offsetHeight });
    }, 100);
  });
  observer.observe(container);

  // Send initial height
  sendToRN({ type: 'height', value: container.offsetHeight });
}
