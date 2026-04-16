import type { ChatScenario, PointingNode, UserAnswer } from '../../../types';
import { serializeNodeToHTML } from '../../core/serializer/index';
import { renderMath } from '../../core/math-renderer';

import {
  renderTextBubble,
  renderDivider,
  createYesNoButtons,
  renderStaticQuestionPhase,
  renderStaticConfirmPhase,
  renderActionBubble,
} from './chat-renderer';
import {
  getTypingTiming,
  getFixedTextTiming,
  showTypingIndicator,
  replaceWithBubble,
  delay,
} from './typing-indicator';
import { scrollToBottom, forceScrollToBottom } from './scroll';

const CONFIRM_PROMPT = '방금 문제를 풀이하며 설명한 흐름대로 생각했나요?';
const DEEPER_LOOK_MESSAGE = '조금 더 자세히 살펴봅시다!';

export interface AnswerEvent {
  pointingId: string;
  step: 'question' | 'confirm';
  response: 'yes' | 'no';
}

export interface ChatConfig {
  /** Text prompt shown in the advance button bubble. Defaults to '다음으로 이동할까요?'. */
  advanceMessage?: string;
  /** Label for the advance button after the last pointing. Defaults to '다음'. */
  advanceButtonLabel?: string;
  /** Called when the user clicks the advance button. */
  onAdvance?: () => void;
}

async function showWithTypingIndicator(
  container: HTMLElement,
  node: PointingNode,
  signal: AbortSignal
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
  signal: AbortSignal
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

async function showInstantly(container: HTMLElement, node: PointingNode): Promise<HTMLElement> {
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

  container.appendChild(bubble);
  await renderMath(bubble);
  scrollToBottom();
  return bubble;
}

function waitForActionButton(
  container: HTMLElement,
  label: string,
  signal: AbortSignal,
  message?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });

    renderActionBubble(
      container,
      label,
      () => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      },
      message
    );
  });
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
  userAnswers: UserAnswer[] | undefined,
  signal: AbortSignal,
  onAnswer: (ev: AnswerEvent) => void,
  config?: ChatConfig
): Promise<UserAnswer[]> {
  const answerMap = new Map<string, UserAnswer>();
  for (const a of userAnswers ?? []) {
    answerMap.set(a.pointingId, a);
  }

  const finalAnswers: UserAnswer[] = [];
  let initialStaticScrolled = false;
  // Track whether we are currently "replaying" static content before the
  // first interactive step so we know when to scroll to the bottom.
  const scrollToCursorIfFirstInteractive = () => {
    if (!initialStaticScrolled) {
      initialStaticScrolled = true;
      forceScrollToBottom(false);
    }
  };

  for (const pointing of scenario.pointings) {
    if (pointing.questionNodes.length === 0) {
      console.warn(`[content-renderer] pointing "${pointing.id}" has no questionNodes; skipping`);
      continue;
    }

    renderDivider(container, pointing.label);

    const existing = answerMap.get(pointing.id);

    // ── Question phase ──
    let questionResponse: 'yes' | 'no';
    if (existing?.questionResponse) {
      await renderStaticQuestionPhase(container, pointing, existing.questionResponse);
      questionResponse = existing.questionResponse;
    } else {
      // Entering interactive — if any preceding static content was rendered,
      // jump the view to the bottom so the user sees the current cursor.
      scrollToCursorIfFirstInteractive();

      let lastBubble: HTMLElement | null = null;
      for (const node of pointing.questionNodes) {
        lastBubble = await showInstantly(container, node);
      }
      if (!lastBubble) continue; // defensive

      questionResponse = await waitForYesNo(lastBubble, signal);
      renderTextBubble(container, questionResponse === 'yes' ? '네' : '아니오', 'user', true);
      onAnswer({ pointingId: pointing.id, step: 'question', response: questionResponse });
    }

    // ── Confirm phase ──
    let confirmResponse: 'yes' | 'no';
    if (existing?.confirmResponse) {
      await renderStaticConfirmPhase(container, pointing, existing.confirmResponse);
      confirmResponse = existing.confirmResponse;
    } else {
      scrollToCursorIfFirstInteractive();

      await showFixedMessage(container, DEEPER_LOOK_MESSAGE, signal);

      for (const node of pointing.answerNodes) {
        await showWithTypingIndicator(container, node, signal);
      }

      const confirmBubble = await showFixedMessage(container, CONFIRM_PROMPT, signal);
      confirmResponse = await waitForYesNo(confirmBubble, signal);
      renderTextBubble(container, confirmResponse === 'yes' ? '네' : '아니오', 'user', true);
      onAnswer({ pointingId: pointing.id, step: 'confirm', response: confirmResponse });
    }

    finalAnswers.push({
      pointingId: pointing.id,
      questionResponse,
      confirmResponse,
    });

    // Show "다음 포인팅" button between pointings (skip for last)
    const isLastPointing = scenario.pointings.indexOf(pointing) === scenario.pointings.length - 1;
    if (!isLastPointing && !existing?.confirmResponse) {
      await waitForActionButton(container, '다음 포인팅', signal, '다음 포인팅으로 이동할까요?');
    }
  }

  // All pointings were static → no interactive scroll yet. Bring user to the end.
  scrollToCursorIfFirstInteractive();

  // Advance button after last pointing
  const advanceLabel = config?.advanceButtonLabel ?? '다음';
  const advanceMessage = config?.advanceMessage ?? '다음으로 이동할까요?';
  await waitForActionButton(container, advanceLabel, signal, advanceMessage);
  config?.onAdvance?.();

  return finalAnswers;
}
