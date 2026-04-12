import type { ChatScenario, PointingNode, UserAnswer, JSONNode } from '../../../types';
import { serializeNodeToHTML } from '../../core/serializer/index';
import { renderMath } from '../../core/math-renderer';
import { scrollToBottom } from './scroll';

function createBubbleElement(
  html: string,
  side: 'system' | 'user',
  animated: boolean,
): HTMLElement {
  const el = document.createElement('div');
  el.className = `chat-bubble chat-bubble--${side}`;
  if (animated) el.style.animation = 'bubbleIn 300ms ease-out';
  el.innerHTML = html;
  return el;
}

function createExpandButton(expandNode: JSONNode): { btn: HTMLButtonElement; content: HTMLElement } {
  const btn = document.createElement('button');
  btn.className = 'chat-expand-btn';
  btn.textContent = '?';

  const content = document.createElement('div');
  content.className = 'chat-expand-content';
  content.innerHTML = serializeNodeToHTML(expandNode);

  btn.addEventListener('click', () => {
    content.classList.toggle('chat-expand-content--visible');
  });

  return { btn, content };
}

export async function renderBubble(
  container: HTMLElement,
  node: PointingNode,
  side: 'system' | 'user',
): Promise<HTMLElement> {
  const html = serializeNodeToHTML(node.contentNode);
  const bubble = createBubbleElement(html, side, true);

  if (node.expandContent) {
    const { btn, content } = createExpandButton(node.expandContent);
    bubble.appendChild(btn);
    bubble.appendChild(content);
    await renderMath(content);
  }

  container.appendChild(bubble);
  await renderMath(bubble);
  scrollToBottom();
  return bubble;
}

export function renderTextBubble(
  container: HTMLElement,
  text: string,
  side: 'system' | 'user',
  animated: boolean,
): HTMLElement {
  const bubble = createBubbleElement(`<p>${text}</p>`, side, animated);
  container.appendChild(bubble);
  if (animated) scrollToBottom();
  return bubble;
}

export function renderDivider(container: HTMLElement, label: string): void {
  const el = document.createElement('div');
  el.className = 'chat-divider';
  el.textContent = label;
  container.appendChild(el);
}

export function createYesNoButtons(
  container: HTMLElement,
  onSelect: (answer: 'yes' | 'no') => void,
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-choices';

  const yesBtn = document.createElement('button');
  yesBtn.className = 'chat-choice-btn';
  yesBtn.textContent = '네';

  const noBtn = document.createElement('button');
  noBtn.className = 'chat-choice-btn';
  noBtn.textContent = '아니오';

  const handleClick = (answer: 'yes' | 'no') => {
    yesBtn.disabled = true;
    noBtn.disabled = true;
    onSelect(answer);
  };

  yesBtn.addEventListener('click', () => handleClick('yes'));
  noBtn.addEventListener('click', () => handleClick('no'));

  wrapper.appendChild(yesBtn);
  wrapper.appendChild(noBtn);
  container.appendChild(wrapper);
  scrollToBottom();
  return wrapper;
}

export async function renderAllBubbles(
  container: HTMLElement,
  scenario: ChatScenario,
  userAnswers?: UserAnswer[],
): Promise<void> {
  for (let i = 0; i < scenario.pointings.length; i++) {
    const pointing = scenario.pointings[i];
    const answer = userAnswers?.[i];

    // Divider (skip first)
    if (i > 0) {
      renderDivider(container, pointing.label);
    }

    // Question nodes
    for (const node of pointing.questionNodes) {
      const html = serializeNodeToHTML(node.contentNode);
      const bubble = createBubbleElement(html, 'system', false);
      if (node.expandContent) {
        const { btn, content } = createExpandButton(node.expandContent);
        bubble.appendChild(btn);
        bubble.appendChild(content);
        await renderMath(content);
      }
      container.appendChild(bubble);
      await renderMath(bubble);
    }

    // User response to question
    if (answer) {
      renderTextBubble(container, answer.questionResponse === 'yes' ? '네' : '아니오', 'user', false);
    }

    // Fixed message
    renderTextBubble(container, '조금 더 자세히 살펴봅시다!', 'system', false);

    // Answer nodes
    for (const node of pointing.answerNodes) {
      const html = serializeNodeToHTML(node.contentNode);
      const bubble = createBubbleElement(html, 'system', false);
      if (node.expandContent) {
        const { btn, content } = createExpandButton(node.expandContent);
        bubble.appendChild(btn);
        bubble.appendChild(content);
        await renderMath(content);
      }
      container.appendChild(bubble);
      await renderMath(bubble);
    }

    // Fixed confirm message
    renderTextBubble(container, '방금 문제를 풀이하며 설명한 흐름대로 생각했나요?', 'system', false);

    // User confirm response
    if (answer) {
      renderTextBubble(
        container,
        answer.confirmResponse === 'yes' ? '네' : '아니오',
        'user',
        false,
      );
    }
  }
}
