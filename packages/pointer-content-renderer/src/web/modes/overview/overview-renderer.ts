import type { OverviewSection } from '../../../types';
import { serializeJSONToHTML } from '../../core/serializer/index';
import { renderMath } from '../../core/math-renderer';
import { renderAllBubbles } from '../chat/chat-renderer';
import { sendToRN } from '../../bridge';

import { setBookmarkButtonState } from './bookmark-icons';
import { initBookmarkState, startBookmarkRequest } from './bookmark-state';

export async function renderOverview(
  container: HTMLElement,
  sections: OverviewSection[],
  isCurrent: () => boolean
): Promise<void> {
  for (const section of sections) {
    if (!isCurrent()) return;

    const sectionEl = document.createElement('div');
    sectionEl.className = 'overview-section';
    sectionEl.id = `section-${section.id}`;
    sectionEl.dataset.sectionId = section.id;

    switch (section.display.type) {
      case 'card':
        switch (section.display.variant) {
          case 'default':
            await renderCardDefault(sectionEl, section.display);
            break;
          case 'pointing':
            await renderCardPointing(sectionEl, section.display, section.id);
            break;
          case 'collapsible':
            await renderCardCollapsible(sectionEl, section.display);
            break;
        }
        break;
      case 'plain':
        await renderPlain(sectionEl, section.display);
        break;
      case 'chat':
        await renderChatSection(sectionEl, section.display);
        break;
      case 'divider':
        renderDividerSection(sectionEl, section.display);
        break;
    }

    if (!isCurrent()) return;
    container.appendChild(sectionEl);
  }
}

// ── Card: default ──

async function renderCardDefault(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'card'; variant: 'default' }>
): Promise<void> {
  el.classList.add('section-card', 'section-card--default');

  if (display.displayLabel) {
    const labelEl = document.createElement('div');
    labelEl.className = 'section-card-label';
    labelEl.textContent = display.displayLabel;
    el.appendChild(labelEl);
  }

  const contentEl = document.createElement('div');
  contentEl.className = 'section-card-content';
  contentEl.innerHTML = renderNodeToHTML(display.content);
  el.appendChild(contentEl);
  await renderMath(contentEl);
}

// ── Card: pointing ──

async function renderCardPointing(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'card'; variant: 'pointing' }>,
  sectionId: string
): Promise<void> {
  el.classList.add('section-card', 'section-card--pointing');

  // Top section: header + bookmark + question (bordered container)
  const topEl = document.createElement('div');
  topEl.className = 'section-card-pointing-top';

  const header = document.createElement('div');
  header.className = 'section-card-pointing-header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'section-card-pointing-title-group';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'section-card-pointing-title';
  titleSpan.textContent = display.title;

  const subtitleSpan = document.createElement('span');
  subtitleSpan.className = 'section-card-pointing-subtitle';
  subtitleSpan.textContent = display.subtitle;

  titleGroup.appendChild(titleSpan);
  titleGroup.appendChild(subtitleSpan);
  header.appendChild(titleGroup);

  if (false && display.bookmarkable) {
    const btn = document.createElement('button');
    btn.className = 'bookmark-btn';
    setBookmarkButtonState(btn, !!display.bookmarked);
    initBookmarkState(sectionId, !!display.bookmarked);
    btn.addEventListener('click', () => {
      const newState = !btn.classList.contains('bookmark-btn--active');
      const requestId = startBookmarkRequest(sectionId);
      if (requestId == null) return; // already pending — ignore click
      btn.disabled = true;
      setBookmarkButtonState(btn, newState);
      sendToRN({ type: 'bookmark', sectionId, bookmarked: newState, requestId });
    });
    header.appendChild(btn);
  }

  topEl.appendChild(header);

  const questionEl = document.createElement('div');
  questionEl.className = 'section-card-pointing-question';
  questionEl.innerHTML = renderNodeToHTML(display.question);
  topEl.appendChild(questionEl);
  await renderMath(questionEl);

  el.appendChild(topEl);

  // Answer content (outside top container)
  const answerEl = document.createElement('div');
  answerEl.className = 'section-card-pointing-answer';
  answerEl.innerHTML = renderNodeToHTML(display.answer);
  el.appendChild(answerEl);
  await renderMath(answerEl);
}

// ── Card: collapsible ──

async function renderCardCollapsible(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'card'; variant: 'collapsible' }>
): Promise<void> {
  el.classList.add('section-card', 'section-card--collapsible');

  // Header: title + chevron
  const header = document.createElement('div');
  header.className = 'section-card-collapsible-header';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'section-card-collapsible-title';
  titleSpan.textContent = display.title;

  const chevron = document.createElement('span');
  chevron.className = 'section-card-collapsible-chevron';
  chevron.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="#6B6F77" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  header.appendChild(titleSpan);
  header.appendChild(chevron);
  el.appendChild(header);

  // Collapsible content
  const contentEl = document.createElement('div');
  contentEl.className = 'section-card-collapsible-content';
  const innerEl = document.createElement('div');
  innerEl.className = 'section-card-collapsible-content-inner';
  innerEl.innerHTML = renderNodeToHTML(display.content);
  contentEl.appendChild(innerEl);
  el.appendChild(contentEl);
  await renderMath(innerEl);

  // CSS: `.section-card-collapsible-content` transitions max-height 300ms.
  // Fallback timeout has a 50ms safety margin so we recover when
  // `transitionend` is preempted (rapid toggle, prefers-reduced-motion,
  // CSS transition disabled in WebView dev tools, etc.) and the header
  // would otherwise stay stuck with `transitioning = true`.
  const COLLAPSIBLE_TRANSITION_MS = 350;

  let isOpen = false;
  let transitioning = false;

  // Run `cb` on first of {transitionend, timeout}, then unregister both.
  const runOnceOnTransitionEnd = (target: HTMLElement, cb: () => void): void => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      target.removeEventListener('transitionend', onTransitionEnd);
      window.clearTimeout(timer);
      cb();
    };
    const onTransitionEnd = () => finish();
    target.addEventListener('transitionend', onTransitionEnd);
    const timer = window.setTimeout(finish, COLLAPSIBLE_TRANSITION_MS);
  };

  header.addEventListener('click', () => {
    if (transitioning) return;
    transitioning = true;

    runOnceOnTransitionEnd(contentEl, () => {
      transitioning = false;
    });

    if (isOpen) {
      contentEl.style.maxHeight = `${contentEl.scrollHeight}px`;
      requestAnimationFrame(() => {
        contentEl.style.maxHeight = '0';
      });
      el.classList.remove('section-card--collapsible-open');
      isOpen = false;
    } else {
      contentEl.style.maxHeight = `${contentEl.scrollHeight}px`;
      el.classList.add('section-card--collapsible-open');
      isOpen = true;
      runOnceOnTransitionEnd(contentEl, () => {
        contentEl.style.maxHeight = 'none';
      });
    }
  });
}

// ── Plain ──

async function renderPlain(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'plain' }>
): Promise<void> {
  el.classList.add('section-plain');
  el.innerHTML = renderNodeToHTML(display.content);
  await renderMath(el);
}

// ── Chat ──

async function renderChatSection(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'chat' }>
): Promise<void> {
  el.classList.add('section-chat');
  await renderAllBubbles(el, display.scenario, display.userAnswers);
}

// ── Divider ──

function renderDividerSection(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'divider' }>
): void {
  el.classList.add('section-divider');
  if (display.text) {
    el.textContent = display.text;
  } else {
    el.classList.add('section-divider--plain');
  }
}

// ── Helper ──

function renderNodeToHTML(node: import('../../../types').JSONNode): string {
  if (node.type === 'doc') {
    return serializeJSONToHTML(node);
  }
  return serializeJSONToHTML({ type: 'doc', content: [node] });
}
