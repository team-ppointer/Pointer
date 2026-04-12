import type { OverviewSection } from '../../../types';
import { serializeJSONToHTML } from '../../core/serializer/index';
import { renderMath } from '../../core/math-renderer';
import { renderAllBubbles } from '../chat/chat-renderer';
import { sendToRN } from '../../bridge';

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
        await renderCard(sectionEl, section.display, section.id);
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

async function renderCard(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'card' }>,
  sectionId: string,
): Promise<void> {
  el.classList.add('section-card', `section-card--${display.variant}`);

  const contentEl = document.createElement('div');
  contentEl.className = 'section-card-content';

  const node = display.content;
  if (node.type === 'doc') {
    contentEl.innerHTML = serializeJSONToHTML(node);
  } else {
    contentEl.innerHTML = serializeJSONToHTML({ type: 'doc', content: [node] });
  }
  el.appendChild(contentEl);
  await renderMath(contentEl);

  if (display.bookmarkable) {
    const btn = document.createElement('button');
    btn.className = `bookmark-btn ${display.bookmarked ? 'bookmark-btn--active' : 'bookmark-btn--inactive'}`;
    btn.textContent = display.bookmarked ? '★' : '☆';
    btn.addEventListener('click', () => {
      const isCurrentlyBookmarked = btn.classList.contains('bookmark-btn--active');
      const newState = !isCurrentlyBookmarked;
      btn.classList.toggle('bookmark-btn--active', newState);
      btn.classList.toggle('bookmark-btn--inactive', !newState);
      btn.textContent = newState ? '★' : '☆';
      btn.dataset.pendingBookmark = String(newState);
      sendToRN({ type: 'bookmark', sectionId, bookmarked: newState });
    });
    el.appendChild(btn);
  }
}

async function renderPlain(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'plain' }>,
): Promise<void> {
  el.classList.add('section-plain');

  const node = display.content;

  if (display.collapsible) {
    el.classList.add('section-plain--collapsible');

    const header = document.createElement('div');
    header.className = 'section-collapsible-header';
    header.innerHTML =
      '<span>자세히 보기</span><span class="section-collapsible-toggle">▼</span>';

    const content = document.createElement('div');
    content.className = 'section-collapsible-content';
    if (node.type === 'doc') {
      content.innerHTML = serializeJSONToHTML(node);
    } else {
      content.innerHTML = serializeJSONToHTML({ type: 'doc', content: [node] });
    }

    header.addEventListener('click', () => {
      content.classList.toggle('section-collapsible-content--open');
      header
        .querySelector('.section-collapsible-toggle')
        ?.classList.toggle('section-collapsible-toggle--open');
    });

    el.appendChild(header);
    el.appendChild(content);
    await renderMath(content);
  } else {
    if (node.type === 'doc') {
      el.innerHTML = serializeJSONToHTML(node);
    } else {
      el.innerHTML = serializeJSONToHTML({ type: 'doc', content: [node] });
    }
    await renderMath(el);
  }
}

async function renderChatSection(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'chat' }>,
): Promise<void> {
  el.classList.add('section-chat');
  await renderAllBubbles(el, display.scenario, display.userAnswers);
}

function renderDividerSection(
  el: HTMLElement,
  display: Extract<OverviewSection['display'], { type: 'divider' }>,
): void {
  el.classList.add('section-divider');
  el.textContent = display.text;
}
