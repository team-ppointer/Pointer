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

export const EXPAND_BUTTON_INNER_HTML =
  '<span class="chat-expand-btn__circle"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.60352 6.50262C6.8778 5.7229 7.41919 5.06541 8.1318 4.64661C8.8444 4.2278 9.68223 4.07471 10.4969 4.21445C11.3115 4.35418 12.0505 4.77773 12.5828 5.41007C13.1151 6.0424 13.4064 6.84273 13.4052 7.66928C13.4052 10.0026 9.90518 11.1693 9.90518 11.1693" stroke="#3E3F45" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.99805 15.8359H10.0097" stroke="#3E3F45" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

function createBubbleElement(
  html: string,
  side: 'system' | 'user',
  animated: boolean
): HTMLElement {
  const el = document.createElement('div');
  el.className = `chat-bubble chat-bubble--${side}`;
  if (animated) el.style.animation = 'bubbleIn 300ms ease-out';

  const main = document.createElement('div');
  main.className = 'chat-bubble__main';
  main.innerHTML = html;
  el.appendChild(main);

  return el;
}

/** Returns the inner `.chat-bubble__main` wrapper that holds text + interactive controls. */
export function getBubbleMain(bubble: HTMLElement): HTMLElement {
  return bubble.firstElementChild as HTMLElement;
}

export function createExpandButton(expandNode: JSONNode): {
  btn: HTMLButtonElement;
  content: HTMLElement;
} {
  const btn = document.createElement('button');
  btn.className = 'chat-expand-btn';
  btn.innerHTML = EXPAND_BUTTON_INNER_HTML;

  const content = document.createElement('div');
  content.className = 'chat-expand-content';
  const inner = document.createElement('div');
  inner.className = 'chat-expand-content__inner';
  inner.innerHTML = serializeNodeToHTML(expandNode);
  content.appendChild(inner);

  btn.addEventListener('click', () => {
    const isVisible = content.classList.contains('chat-expand-content--visible');
    if (isVisible) {
      // Closing: freeze current height (might be 'auto'), force reflow, then transition to 0.
      content.style.height = `${content.scrollHeight}px`;
      void content.offsetHeight;
      content.style.height = '0';
      content.classList.remove('chat-expand-content--visible');
    } else {
      // Opening: explicit target px so transition has an end value, then 'auto' after end for content resilience.
      const target = content.scrollHeight;
      content.style.height = `${target}px`;
      content.classList.add('chat-expand-content--visible');
      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName !== 'height') return;
        content.removeEventListener('transitionend', onEnd);
        if (content.classList.contains('chat-expand-content--visible')) {
          content.style.height = 'auto';
        }
      };
      content.addEventListener('transitionend', onEnd);
    }
  });

  return { btn, content };
}

/** Wraps `bubble` + `btn` in a flex row so the bubble can keep overflow:hidden without clipping the button. */
export function wrapWithExpandButton(bubble: HTMLElement, btn: HTMLButtonElement): HTMLElement {
  const row = document.createElement('div');
  row.className = 'chat-bubble-row';
  row.appendChild(bubble);
  row.appendChild(btn);
  return row;
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
    bubble.appendChild(content);
    container.appendChild(wrapWithExpandButton(bubble, btn));
    await renderMath(content);
  } else {
    container.appendChild(bubble);
  }
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
    bubble.appendChild(content);
    container.appendChild(wrapWithExpandButton(bubble, btn));
    await renderMath(content);
  } else {
    container.appendChild(bubble);
  }

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
  const bubble = createBubbleElement('', side, animated);
  const p = document.createElement('p');
  p.textContent = text;
  getBubbleMain(bubble).appendChild(p);
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
  getBubbleMain(bubble).appendChild(wrapper);
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
  getBubbleMain(bubble).appendChild(wrapper);
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
  const bubble = createBubbleElement('', 'system', true);
  const main = getBubbleMain(bubble);

  if (message) {
    const p = document.createElement('p');
    p.textContent = message;
    main.appendChild(p);
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
  main.appendChild(wrapper);
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
