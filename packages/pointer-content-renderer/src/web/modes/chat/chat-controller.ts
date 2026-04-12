import type { ChatScenario, PointingNode, UserAnswer } from '../../../types';
import { serializeNodeToHTML } from '../../core/serializer/index';
import { renderMath } from '../../core/math-renderer';
import { renderTextBubble, renderDivider, createYesNoButtons } from './chat-renderer';
import {
  getTypingTiming,
  getFixedTextTiming,
  showTypingIndicator,
  replaceWithBubble,
  delay,
} from './typing-indicator';
import { scrollToBottom } from './scroll';

async function showWithTypingIndicator(
  container: HTMLElement,
  node: PointingNode,
): Promise<void> {
  const timing = getTypingTiming(node.contentNode);

  await delay(timing.preDelay);

  const indicator = showTypingIndicator(container);

  await delay(timing.duration);

  const html = serializeNodeToHTML(node.contentNode);
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble--system';
  bubble.style.animation = 'bubbleIn 300ms ease-out';
  bubble.innerHTML = html;

  if (node.expandContent) {
    const expandBtn = document.createElement('button');
    expandBtn.className = 'chat-expand-btn';
    expandBtn.textContent = '?';

    const expandContent = document.createElement('div');
    expandContent.className = 'chat-expand-content';
    expandContent.innerHTML = serializeNodeToHTML(node.expandContent);

    expandBtn.addEventListener('click', () => {
      expandContent.classList.toggle('chat-expand-content--visible');
    });

    bubble.appendChild(expandBtn);
    bubble.appendChild(expandContent);
    await renderMath(expandContent);
  }

  replaceWithBubble(indicator, bubble);
  await renderMath(bubble);
  // Re-scroll after KaTeX rendering may have changed bubble height
  scrollToBottom();
}

async function showFixedMessage(container: HTMLElement, text: string): Promise<void> {
  const timing = getFixedTextTiming(text);
  await delay(timing.preDelay);
  const indicator = showTypingIndicator(container);
  await delay(timing.duration);
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble--system';
  bubble.style.animation = 'bubbleIn 300ms ease-out';
  bubble.innerHTML = `<p>${text}</p>`;
  replaceWithBubble(indicator, bubble);
}

function waitForYesNo(container: HTMLElement): Promise<'yes' | 'no'> {
  return new Promise((resolve) => {
    createYesNoButtons(container, resolve);
    scrollToBottom();
  });
}

export async function runChatScenario(
  container: HTMLElement,
  scenario: ChatScenario,
): Promise<UserAnswer[]> {
  const answers: UserAnswer[] = [];

  for (let i = 0; i < scenario.pointings.length; i++) {
    const pointing = scenario.pointings[i];

    // 1. Divider
    renderDivider(container, pointing.label);

    // 2. Question nodes sequentially with typing indicator
    for (const node of pointing.questionNodes) {
      await showWithTypingIndicator(container, node);
    }

    // 3. Yes/No selection
    const questionResponse = await waitForYesNo(container);
    renderTextBubble(container, questionResponse === 'yes' ? '네' : '아니오', 'user', true);

    // 4. Fixed message: "조금 더 자세히 살펴봅시다!"
    await showFixedMessage(container, '조금 더 자세히 살펴봅시다!');

    // 5. Answer nodes sequentially
    for (const node of pointing.answerNodes) {
      await showWithTypingIndicator(container, node);
    }

    // 6. Fixed confirm message + Yes/No
    await showFixedMessage(container, '방금 문제를 풀이하며 설명한 흐름대로 생각했나요?');
    const confirmResponse = await waitForYesNo(container);
    renderTextBubble(container, confirmResponse === 'yes' ? '네' : '아니오', 'user', true);

    answers.push({
      pointingId: pointing.id,
      questionResponse,
      confirmResponse,
    });
  }

  return answers;
}
