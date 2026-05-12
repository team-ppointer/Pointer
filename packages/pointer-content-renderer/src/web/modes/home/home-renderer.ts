// ── Home mode renderer ──

import { serializeJSONToHTML } from '../../core/serializer/index';
import { renderMath } from '../../core/math-renderer';
import { sendToRN } from '../../bridge';
import type {
  HomeCard,
  HomeCommentCard,
  HomeStudySummaryCard,
  HomeStudyGroup,
  HomeStudyItem,
} from '../../../types';

import {
  commentIconSvg,
  studyIconSvg,
  hourglassSvg,
  chevronDownSvg,
  chevronUpSvg,
} from './home-icons';

// ── 유틸 ──

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  html?: string
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function reportHeight(): void {
  sendToRN({
    type: 'height',
    value: document.documentElement.scrollHeight,
  });
}

// ── 메인 ──

export async function renderHome(
  container: HTMLElement,
  cards: HomeCard[],
  name: string,
  isCurrent: () => boolean
): Promise<() => void> {
  container.classList.add('home-mode');
  const disposers: (() => void)[] = [];

  for (const card of cards) {
    if (!isCurrent()) return () => {};
    switch (card.type) {
      case 'comment':
        disposers.push(await renderCommentCard(container, name, card, isCurrent));
        break;
      case 'study-summary':
        disposers.push(await renderStudySummaryCard(container, name, card, isCurrent));
        break;
    }
  }

  // 렌더 완료 후 초기 높이 보고
  requestAnimationFrame(() => reportHeight());

  return () => disposers.forEach((d) => d());
}

// ── 1:1 코멘트 카드 ──

async function renderCommentCard(
  parent: HTMLElement,
  name: string,
  card: HomeCommentCard,
  isCurrent: () => boolean
): Promise<() => void> {
  const root = el('div', 'home-card');

  // 카드 내부 컨테이너
  const inner = el('div', 'home-card-inner');

  // ─ 헤더 (title + time)
  const header = el('div', 'home-card-header');

  const headerLeft = el('div', 'home-card-header-left');
  const icon = el('div', 'home-card-header-icon', commentIconSvg);
  const title = el('div', 'home-card-title', `${name}을(를) 위한 1:1 코멘트`);
  headerLeft.append(icon, title);

  // 시간 뱃지
  const urgent = card.timeRemainingInHours <= 4;
  const timeBadge = el(
    'div',
    `home-comment-time${urgent ? ' home-comment-time--urgent' : ''}`,
    `${hourglassSvg(urgent)}${card.timeRemainingInHours}h`
  );

  header.append(headerLeft, timeBadge);

  // ─ 부제
  const subtitle = el('div', 'home-card-subtitle', '출제진이 직접 작성한 코멘트에요.');

  // ─ 코멘트 body (gray box)
  const body = el('div', 'home-comment-body');
  const bodyContainer = el('div', 'home-comment-body-container');
  const bodyContent = el('div', 'home-comment-body-content');

  // content 렌더
  const contentHtml = serializeJSONToHTML(card.content);
  bodyContent.innerHTML = contentHtml;
  bodyContainer.appendChild(bodyContent);

  // fade gradient
  const fade = el('div', 'home-comment-fade');
  bodyContainer.appendChild(fade);

  body.appendChild(bodyContainer);

  // ─ 토글 버튼
  const toggle = el('button', 'home-collapsible-toggle', `펼치기${chevronDownSvg}`);

  body.appendChild(toggle);

  inner.append(header, subtitle, body);
  root.append(inner);
  parent.appendChild(root);

  // math 렌더
  if (!isCurrent()) return () => {};
  await renderMath(bodyContent);

  // ─ collapsible 설정 (렌더 후 높이 비교)
  const disposer = setupCommentCollapsible(bodyContainer, fade, toggle);

  return disposer;
}

function setupCommentCollapsible(
  bodyContainer: HTMLElement,
  fade: HTMLElement,
  toggle: HTMLButtonElement
): () => void {
  const COLLAPSED_MAX_HEIGHT = 104; // 24px line-height × 4줄 + 8px padding
  let isOpen = false;

  // 1프레임 뒤에 높이 비교
  requestAnimationFrame(() => {
    const actualHeight = bodyContainer.scrollHeight;
    if (actualHeight <= COLLAPSED_MAX_HEIGHT) {
      // 내용이 짧으면 collapsible 불필요
      toggle.classList.add('home-collapsible-toggle--hidden');
      fade.classList.add('home-comment-fade--hidden');
      return;
    }

    // 접힌 상태로 시작
    bodyContainer.classList.add('home-comment-body-container--collapsed');
  });

  const handler = () => {
    const actualHeight = bodyContainer.scrollHeight;
    if (isOpen) {
      // 접기
      bodyContainer.style.maxHeight = `${bodyContainer.scrollHeight}px`;
      requestAnimationFrame(() => {
        bodyContainer.style.maxHeight = `${COLLAPSED_MAX_HEIGHT}px`;
        bodyContainer.classList.remove('home-comment-body-container--expanded');
        bodyContainer.classList.add('home-comment-body-container--collapsed');
        fade.classList.remove('home-comment-fade--hidden');
        toggle.innerHTML = `펼치기${chevronDownSvg}`;
      });
    } else {
      // 펼치기
      bodyContainer.classList.remove('home-comment-body-container--collapsed');
      bodyContainer.classList.add('home-comment-body-container--expanded');
      bodyContainer.style.maxHeight = `${actualHeight}px`;
      fade.classList.add('home-comment-fade--hidden');
      toggle.innerHTML = `접기${chevronUpSvg}`;

      // transition 끝나면 max-height 해제
      const onEnd = () => {
        bodyContainer.style.maxHeight = '';
        bodyContainer.removeEventListener('transitionend', onEnd);
        reportHeight();
      };
      bodyContainer.addEventListener('transitionend', onEnd, { once: true });
    }
    isOpen = !isOpen;

    // 높이 재보고
    setTimeout(() => reportHeight(), 350);
  };

  toggle.addEventListener('click', handler);
  return () => toggle.removeEventListener('click', handler);
}

// ── 학습 내용 정리 카드 ──

async function renderStudySummaryCard(
  parent: HTMLElement,
  name: string,
  card: HomeStudySummaryCard,
  isCurrent: () => boolean
): Promise<() => void> {
  const root = el('div', 'home-card');
  const inner = el('div', 'home-card-inner');

  // ─ 헤더
  const header = el('div', 'home-card-header');
  const headerLeft = el('div', 'home-card-header-left');
  const icon = el('div', 'home-card-header-icon', studyIconSvg);
  const title = el('div', 'home-card-title home-card-title--primary');
  title.textContent = `${name}에게 꼭 필요한 학습 내용 정리`;
  headerLeft.append(icon, title);
  header.appendChild(headerLeft);

  // ─ 설명
  const desc = el('div', 'home-card-subtitle');
  desc.innerHTML = `${name}님의 학습을 분석해 취약점을 도출했어요.<br>지금 바로 출제진의 문제 접근법을 배워봐요.`;

  // ─ groups
  const groupsContainer = el('div', 'home-study-groups');
  const disposers: (() => void)[] = [];

  for (const group of card.groups) {
    if (!isCurrent()) break;
    const d = await renderStudyGroup(groupsContainer, group, isCurrent);
    disposers.push(...d);
  }

  inner.append(header, desc, groupsContainer);
  root.appendChild(inner);
  parent.appendChild(root);

  return () => disposers.forEach((d) => d());
}

async function renderStudyGroup(
  parent: HTMLElement,
  group: HomeStudyGroup,
  isCurrent: () => boolean
): Promise<(() => void)[]> {
  const root = el('div', 'home-study-group');

  // 세로 연결선
  const line = el('div', 'home-study-group-line');
  const lineInner = el('div', 'home-study-group-line-inner');
  line.appendChild(lineInner);
  root.appendChild(line);

  // 도트 + 라벨
  const header = el('div', 'home-study-group-header');
  const dot = el('div', 'home-study-group-dot');
  const dotInner = el(
    'div',
    `home-study-group-dot-inner ${
      group.highlighted ? 'home-study-group-dot-inner--active' : 'home-study-group-dot-inner--muted'
    }`
  );
  dot.appendChild(dotInner);
  const label = el('div', 'home-study-group-label', group.label);
  header.append(dot, label);

  // 카드들
  const cards = el('div', 'home-study-group-cards');
  const disposers: (() => void)[] = [];

  for (const item of group.items) {
    if (!isCurrent()) break;
    const d = await renderStudyItem(cards, item, isCurrent);
    disposers.push(d);
  }

  root.append(header, cards);
  parent.appendChild(root);

  return disposers;
}

async function renderStudyItem(
  parent: HTMLElement,
  item: HomeStudyItem,
  isCurrent: () => boolean
): Promise<() => void> {
  const root = el('div', 'home-study-item');

  // ─ 헤더 (badges + headline + title)
  const headerSection = el('div', 'home-study-item-header');
  const headline = el('div', 'home-study-item-headline');

  for (const badge of item.badges) {
    const b = el('div', `home-study-badge home-study-badge--${badge.variant}`);
    b.textContent = badge.text;
    headline.appendChild(b);
  }

  if (item.headerText) {
    const headlineText = el('div', 'home-study-item-headline-text');
    headlineText.textContent = item.headerText;
    headline.appendChild(headlineText);
  }

  const title = el('div', 'home-study-item-title');
  // title은 content의 첫 paragraph 또는 전체를 사용
  const titleHtml = serializeJSONToHTML(item.content);
  title.innerHTML = titleHtml;

  headerSection.append(headline, title);

  // ─ 펼칠 콘텐츠 (LaTeX 포함)
  const contentEl = el('div', 'home-study-item-content home-study-item-content--collapsed');
  const contentHtml = serializeJSONToHTML(item.content);
  contentEl.innerHTML = contentHtml;

  // ─ 토글 버튼
  const toggle = el('button', 'home-collapsible-toggle', `펼치기${chevronDownSvg}`);

  root.append(headerSection, contentEl, toggle);
  parent.appendChild(root);

  // math 렌더
  if (!isCurrent()) return () => {};
  await renderMath(title);
  await renderMath(contentEl);

  // ─ collapsible 설정
  const disposer = setupStudyItemCollapsible(contentEl, toggle);
  return disposer;
}

function setupStudyItemCollapsible(contentEl: HTMLElement, toggle: HTMLButtonElement): () => void {
  let isOpen = false;

  const handler = () => {
    if (isOpen) {
      // 접기
      contentEl.style.maxHeight = `${contentEl.scrollHeight}px`;
      requestAnimationFrame(() => {
        contentEl.style.maxHeight = '0';
        contentEl.classList.remove('home-study-item-content--expanded');
        contentEl.classList.add('home-study-item-content--collapsed');
        toggle.innerHTML = `펼치기${chevronDownSvg}`;
      });
    } else {
      // 펼치기
      contentEl.classList.remove('home-study-item-content--collapsed');
      contentEl.classList.add('home-study-item-content--expanded');
      const fullHeight = contentEl.scrollHeight;
      contentEl.style.maxHeight = `${fullHeight}px`;
      toggle.innerHTML = `접기${chevronUpSvg}`;

      const onEnd = () => {
        contentEl.style.maxHeight = '';
        contentEl.removeEventListener('transitionend', onEnd);
        reportHeight();
      };
      contentEl.addEventListener('transitionend', onEnd, { once: true });
    }
    isOpen = !isOpen;
    setTimeout(() => reportHeight(), 350);
  };

  toggle.addEventListener('click', handler);
  return () => toggle.removeEventListener('click', handler);
}
