import type {
  ChatScenario,
  PointingData,
  PointingNode,
  UserAnswer,
  JSONNode,
} from '../../../types';
import { serializeNodeToHTML } from '../../core/serializer/index';
import { renderMath } from '../../core/math-renderer';

import { scrollToBottom } from './scroll';

const CONFIRM_PROMPT = '방금 문제를 풀이하며 설명한 흐름대로 생각했나요?';
const DEEPER_LOOK_MESSAGE = '조금 더 자세히 살펴봅시다!';

function createBubbleElement(
  html: string,
  side: 'system' | 'user',
  animated: boolean
): HTMLElement {
  const el = document.createElement('div');
  el.className = `chat-bubble chat-bubble--${side}`;
  if (animated) el.style.animation = 'bubbleIn 300ms ease-out';
  el.innerHTML = html;
  return el;
}

function createExpandButton(expandNode: JSONNode): {
  btn: HTMLButtonElement;
  content: HTMLElement;
} {
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

/** Render a single pointing node as a static (non-animated) system bubble. */
async function appendStaticPointingNodeBubble(
  container: HTMLElement,
  node: PointingNode
): Promise<HTMLElement> {
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
  return bubble;
}

export async function renderBubble(
  container: HTMLElement,
  node: PointingNode,
  side: 'system' | 'user'
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
  animated: boolean
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

/**
 * Append yes/no buttons inside a bubble element.
 */
export function createYesNoButtons(
  bubble: HTMLElement,
  onSelect: (answer: 'yes' | 'no') => void
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-choices';

  const yesBtn = document.createElement('button');
  yesBtn.className = 'chat-choice-btn';
  yesBtn.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 4.5L6.75 12.75L3 9" stroke="#4A5EF2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>네';

  const noBtn = document.createElement('button');
  noBtn.className = 'chat-choice-btn';
  noBtn.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 4.5L4.5 13.5" stroke="#FF3B30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 4.5L13.5 13.5" stroke="#FF3B30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>아니오';

  const handleClick = (answer: 'yes' | 'no') => {
    yesBtn.disabled = true;
    noBtn.disabled = true;
    if (answer === 'yes') {
      yesBtn.classList.add('chat-choice-btn--selected-yes');
    } else {
      noBtn.classList.add('chat-choice-btn--selected-no');
    }
    onSelect(answer);
  };

  yesBtn.addEventListener('click', () => handleClick('yes'));
  noBtn.addEventListener('click', () => handleClick('no'));

  wrapper.appendChild(yesBtn);
  wrapper.appendChild(noBtn);
  bubble.appendChild(wrapper);
  scrollToBottom();
  return wrapper;
}

/**
 * Render static disabled yes/no buttons inside a bubble with the given answer highlighted.
 */
export function renderStaticYesNo(bubble: HTMLElement, answer: 'yes' | 'no'): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-choices';

  const yesBtn = document.createElement('button');
  yesBtn.className = 'chat-choice-btn';
  yesBtn.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 4.5L6.75 12.75L3 9" stroke="#4A5EF2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>네';
  yesBtn.disabled = true;

  const noBtn = document.createElement('button');
  noBtn.className = 'chat-choice-btn';
  noBtn.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 4.5L4.5 13.5" stroke="#FF3B30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 4.5L13.5 13.5" stroke="#FF3B30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>아니오';
  noBtn.disabled = true;

  if (answer === 'yes') {
    yesBtn.classList.add('chat-choice-btn--selected-yes');
  } else {
    noBtn.classList.add('chat-choice-btn--selected-no');
  }

  wrapper.appendChild(yesBtn);
  wrapper.appendChild(noBtn);
  bubble.appendChild(wrapper);
}

/**
 * Render a completed question phase statically:
 * questionNodes + static yes/no (selected) + user response bubble.
 */
export async function renderStaticQuestionPhase(
  container: HTMLElement,
  pointing: PointingData,
  response: 'yes' | 'no'
): Promise<void> {
  let lastQuestionBubble: HTMLElement | null = null;
  for (const node of pointing.questionNodes) {
    lastQuestionBubble = await appendStaticPointingNodeBubble(container, node);
  }
  if (lastQuestionBubble) {
    renderStaticYesNo(lastQuestionBubble, response);
    renderTextBubble(container, response === 'yes' ? '네' : '아니오', 'user', false);
  }
}

/**
 * Render a completed confirm phase statically:
 * "조금 더..." + answerNodes + "방금..." + static yes/no + user response.
 */
export async function renderStaticConfirmPhase(
  container: HTMLElement,
  pointing: PointingData,
  response: 'yes' | 'no'
): Promise<void> {
  renderTextBubble(container, DEEPER_LOOK_MESSAGE, 'system', false);

  for (const node of pointing.answerNodes) {
    await appendStaticPointingNodeBubble(container, node);
  }

  const confirmBubble = renderTextBubble(container, CONFIRM_PROMPT, 'system', false);
  renderStaticYesNo(confirmBubble, response);
  renderTextBubble(container, response === 'yes' ? '네' : '아니오', 'user', false);
}

/**
 * Render a system bubble with an action button (confirm-prompt style).
 * Optionally includes a text message above the button.
 */
export function renderActionBubble(
  container: HTMLElement,
  buttonLabel: string,
  onAction: () => void,
  message?: string
): HTMLElement {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble--system';
  bubble.style.animation = 'bubbleIn 300ms ease-out';

  if (message) {
    bubble.innerHTML = `<p>${message}</p>`;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'chat-choices';

  const btn = document.createElement('button');
  btn.className = 'chat-choice-btn chat-choice-btn--action';
  btn.textContent = buttonLabel;
  btn.addEventListener(
    'click',
    () => {
      btn.disabled = true;
      onAction();
    },
    { once: true }
  );

  wrapper.appendChild(btn);
  bubble.appendChild(wrapper);
  container.appendChild(bubble);
  scrollToBottom();
  return bubble;
}

export async function renderAllBubbles(
  container: HTMLElement,
  scenario: ChatScenario,
  userAnswers?: UserAnswer[]
): Promise<void> {
  const answerMap = new Map<string, UserAnswer>();
  for (const a of userAnswers ?? []) {
    answerMap.set(a.pointingId, a);
  }

  for (let i = 0; i < scenario.pointings.length; i++) {
    const pointing = scenario.pointings[i];
    const answer = answerMap.get(pointing.id);

    // Divider (skip first — overview provides its own divider section)
    if (i > 0) {
      renderDivider(container, pointing.label);
    }

    // Question nodes
    let lastQuestionBubble: HTMLElement | null = null;
    for (const node of pointing.questionNodes) {
      lastQuestionBubble = await appendStaticPointingNodeBubble(container, node);
    }

    // Yes/No inside last question bubble + user response
    if (answer?.questionResponse && lastQuestionBubble) {
      renderStaticYesNo(lastQuestionBubble, answer.questionResponse);
      renderTextBubble(
        container,
        answer.questionResponse === 'yes' ? '네' : '아니오',
        'user',
        false
      );
    }

    // Fixed message
    renderTextBubble(container, DEEPER_LOOK_MESSAGE, 'system', false);

    // Answer nodes
    for (const node of pointing.answerNodes) {
      await appendStaticPointingNodeBubble(container, node);
    }

    // Confirm prompt
    const confirmBubble = renderTextBubble(container, CONFIRM_PROMPT, 'system', false);

    if (answer?.confirmResponse) {
      renderStaticYesNo(confirmBubble, answer.confirmResponse);
      renderTextBubble(
        container,
        answer.confirmResponse === 'yes' ? '네' : '아니오',
        'user',
        false
      );
    }
  }
}
