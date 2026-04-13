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
  signal: AbortSignal,
): Promise<HTMLElement> {
  const timing = getTypingTiming(node.contentNode);

  await delay(timing.preDelay, signal);

  const indicator = showTypingIndicator(container);

  await delay(timing.duration, signal);

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
  scrollToBottom();
  return bubble;
}

async function showFixedMessage(
  container: HTMLElement,
  text: string,
  signal: AbortSignal,
): Promise<HTMLElement> {
  const timing = getFixedTextTiming(text);
  await delay(timing.preDelay, signal);
  const indicator = showTypingIndicator(container);
  await delay(timing.duration, signal);
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble--system';
  bubble.style.animation = 'bubbleIn 300ms ease-out';
  bubble.innerHTML = `<p>${text}</p>`;
  replaceWithBubble(indicator, bubble);
  return bubble;
}

function waitForYesNo(bubble: HTMLElement, signal: AbortSignal): Promise<'yes' | 'no'> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    createYesNoButtons(bubble, (answer) => {
      signal.removeEventListener('abort', onAbort);
      resolve(answer);
    });
    scrollToBottom();
  });
}

export async function runChatScenario(
  container: HTMLElement,
  scenario: ChatScenario,
  signal: AbortSignal,
): Promise<UserAnswer[]> {
  const answers: UserAnswer[] = [];

  for (let i = 0; i < scenario.pointings.length; i++) {
    const pointing = scenario.pointings[i];

    // 1. Divider
    renderDivider(container, pointing.label);

    // 2. Question nodes sequentially with typing indicator
    let lastQuestionBubble: HTMLElement | null = null;
    for (const node of pointing.questionNodes) {
      lastQuestionBubble = await showWithTypingIndicator(container, node, signal);
    }

    // 3. Yes/No inside last question bubble
    const questionResponse = await waitForYesNo(lastQuestionBubble!, signal);
    renderTextBubble(container, questionResponse === 'yes' ? '네' : '아니오', 'user', true);

    // 4. Fixed message: "조금 더 자세히 살펴봅시다!"
    await showFixedMessage(container, '조금 더 자세히 살펴봅시다!', signal);

    // 5. Answer nodes sequentially
    for (const node of pointing.answerNodes) {
      await showWithTypingIndicator(container, node, signal);
    }

    // 6. Fixed confirm message with Yes/No inside
    const confirmBubble = await showFixedMessage(
      container,
      '방금 문제를 풀이하며 설명한 흐름대로 생각했나요?',
      signal,
    );
    const confirmResponse = await waitForYesNo(confirmBubble, signal);
    renderTextBubble(container, confirmResponse === 'yes' ? '네' : '아니오', 'user', true);

    answers.push({
      pointingId: pointing.id,
      questionResponse,
      confirmResponse,
    });
  }

  return answers;
}
