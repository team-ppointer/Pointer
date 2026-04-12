import type { OverviewSection } from '../../../types';
import { serializeJSONToHTML } from '../../core/serializer/index';
import { renderMath } from '../../core/math-renderer';
import { renderAllBubbles } from '../chat/chat-renderer';
import { sendToRN } from '../../bridge';

const BOOKMARK_ICON_INACTIVE = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8327 17.5L9.99935 14.1667L4.16602 17.5V4.16667C4.16602 3.72464 4.34161 3.30072 4.65417 2.98816C4.96673 2.67559 5.39065 2.5 5.83268 2.5H14.166C14.608 2.5 15.032 2.67559 15.3445 2.98816C15.6571 3.30072 15.8327 3.72464 15.8327 4.16667V17.5Z" stroke="#9FA4AE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const BOOKMARK_ICON_ACTIVE = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8346 17.5L10.0013 14.1667L4.16797 17.5V4.16667C4.16797 3.72464 4.34356 3.30072 4.65612 2.98816C4.96868 2.67559 5.39261 2.5 5.83464 2.5H14.168C14.61 2.5 15.0339 2.67559 15.3465 2.98816C15.659 3.30072 15.8346 3.72464 15.8346 4.16667V17.5Z" fill="#617AF9" stroke="#617AF9" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export async function renderOverview(
  container: HTMLElement,
  sections: OverviewSection[],
): Promise<void> {
  for (const section of sections) {
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

    container.appendChild(sectionEl);
  }
}

// ── Card: default ──

async function renderCardDefault(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'card'; variant: 'default' }>,
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
  sectionId: string,
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

  if (display.bookmarkable) {
    const btn = document.createElement('button');
    btn.className = `bookmark-btn ${display.bookmarked ? 'bookmark-btn--active' : 'bookmark-btn--inactive'}`;
    btn.innerHTML = display.bookmarked ? BOOKMARK_ICON_ACTIVE : BOOKMARK_ICON_INACTIVE;
    btn.addEventListener('click', () => {
      const isCurrentlyBookmarked = btn.classList.contains('bookmark-btn--active');
      const newState = !isCurrentlyBookmarked;
      btn.classList.toggle('bookmark-btn--active', newState);
      btn.classList.toggle('bookmark-btn--inactive', !newState);
      btn.innerHTML = newState ? BOOKMARK_ICON_ACTIVE : BOOKMARK_ICON_INACTIVE;
      sendToRN({ type: 'bookmark', sectionId, bookmarked: newState });
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
  display: Extract<OverviewSection['display'], { type: 'card'; variant: 'collapsible' }>,
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
  chevron.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="#6B6F77" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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

  let isOpen = false;
  let transitioning = false;
  header.addEventListener('click', () => {
    if (transitioning) return;
    transitioning = true;

    const onEnd = () => {
      transitioning = false;
      contentEl.removeEventListener('transitionend', onEnd);
    };
    contentEl.addEventListener('transitionend', onEnd);

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
      const onOpenEnd = () => {
        contentEl.style.maxHeight = 'none';
        contentEl.removeEventListener('transitionend', onOpenEnd);
      };
      contentEl.addEventListener('transitionend', onOpenEnd);
    }
  });
}

// ── Plain ──

async function renderPlain(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'plain' }>,
): Promise<void> {
  el.classList.add('section-plain');
  el.innerHTML = renderNodeToHTML(display.content);
  await renderMath(el);
}

// ── Chat ──

async function renderChatSection(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'chat' }>,
): Promise<void> {
  el.classList.add('section-chat');
  await renderAllBubbles(el, display.scenario, display.userAnswers);
}

// ── Divider ──

function renderDividerSection(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'divider' }>,
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
