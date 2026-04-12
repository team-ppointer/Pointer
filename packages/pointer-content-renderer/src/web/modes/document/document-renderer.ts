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
  // Set font style
  if (options.fontStyle === 'serif') {
    document.documentElement.style.setProperty(
      '--content-font-family',
      '"KoPub Batang", serif',
    );
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
