// ── Home mode renderer ──

import { serializeJSONToHTML } from '../../core/serializer/index';
import { renderMath } from '../../core/math-renderer';
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

/**
 * 줄바꿈(`\n`) 포함 문자열을 안전하게 <br>로 분리해 element 에 채운다.
 */
function appendMultilineText(parent: HTMLElement, text: string): void {
  const lines = text.split('\n');
  lines.forEach((line, idx) => {
    if (idx > 0) parent.appendChild(document.createElement('br'));
    parent.appendChild(document.createTextNode(line));
  });
}

// ── 메인 ──

export async function renderHome(
  container: HTMLElement,
  cards: HomeCard[],
  isCurrent: () => boolean
): Promise<() => void> {
  container.classList.add('home-mode');
  const disposers: (() => void)[] = [];

  for (const card of cards) {
    if (!isCurrent()) return () => {};
    switch (card.type) {
      case 'comment':
        disposers.push(await renderCommentCard(container, card, isCurrent));
        break;
      case 'study-summary':
        disposers.push(await renderStudySummaryCard(container, card, isCurrent));
        break;
    }
  }

  return () => disposers.forEach((d) => d());
}

// ── 1:1 코멘트 카드 ──

async function renderCommentCard(
  parent: HTMLElement,
  card: HomeCommentCard,
  isCurrent: () => boolean
): Promise<() => void> {
  const root = el('div', 'home-card');
  const inner = el('div', 'home-card-inner');

  // ─ 헤더 (title + time)
  const header = el('div', 'home-card-header');

  const headerLeft = el('div', 'home-card-header-left');
  const icon = el('div', 'home-card-header-icon', commentIconSvg);
  const title = el('div', 'home-card-title');
  title.textContent = card.title;
  headerLeft.append(icon, title);

  // 시간 뱃지 (1분 간격으로 자동 갱신). expiryAt 이 null 이면 뱃지 자체를 생략.
  let timeDisposer: () => void = () => {};
  if (card.expiryAt !== null) {
    const timeBadge = el('div');
    timeDisposer = setupTimeBadgeTick(timeBadge, card.expiryAt);
    header.append(headerLeft, timeBadge);
  } else {
    header.append(headerLeft);
  }

  // ─ 부제
  const subtitle = el('div', 'home-card-subtitle');
  appendMultilineText(subtitle, card.subtitle);

  // ─ 코멘트 body (gray box)
  const body = el('div', 'home-comment-body');
  const bodyContainer = el('div', 'home-comment-body-container');
  const bodyContent = el('div', 'home-comment-body-content');

  bodyContent.innerHTML = serializeJSONToHTML(card.content);
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
  if (!isCurrent()) {
    timeDisposer();
    return () => {};
  }
  await renderMath(bodyContent);

  // ─ collapsible 설정 (렌더 후 높이 비교)
  const collapseDisposer = setupCommentCollapsible(bodyContainer, fade, toggle);

  return () => {
    timeDisposer();
    collapseDisposer();
  };
}

/**
 * 만료 시각으로부터 남은 시간(시간 단위, 올림)을 계산해 뱃지를 갱신.
 * 1분 간격으로 자동 갱신. urgent (≤4h) 시 빨간색.
 */
function setupTimeBadgeTick(badge: HTMLElement, expiryAt: number): () => void {
  const update = () => {
    const now = Date.now();
    const remainingMs = Math.max(0, expiryAt - now);
    const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
    const urgent = remainingHours > 0 && remainingHours <= 4;
    badge.className = `home-comment-time${urgent ? ' home-comment-time--urgent' : ''}`;
    badge.innerHTML = `${hourglassSvg(urgent)}${remainingHours}h`;
  };
  update();
  const interval = setInterval(update, 60_000);
  return () => clearInterval(interval);
}

function setupCommentCollapsible(
  bodyContainer: HTMLElement,
  fade: HTMLElement,
  toggle: HTMLButtonElement
): () => void {
  const COLLAPSED_MAX_HEIGHT = 126; // home.css(.home-comment-body-container--collapsed)와 동일
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
      };
      bodyContainer.addEventListener('transitionend', onEnd, { once: true });
    }
    isOpen = !isOpen;
  };

  toggle.addEventListener('click', handler);
  return () => toggle.removeEventListener('click', handler);
}

// ── 학습 내용 정리 카드 ──

async function renderStudySummaryCard(
  parent: HTMLElement,
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
  title.textContent = card.title;
  headerLeft.append(icon, title);
  header.appendChild(headerLeft);

  // ─ 설명
  const desc = el('div', 'home-card-subtitle');
  appendMultilineText(desc, card.subtitle);

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

  // ─ 헤더 (badges + title + description)
  const headerSection = el('div', 'home-study-item-header');
  const headline = el('div', 'home-study-item-headline');

  for (const badge of item.badges) {
    const b = el('div', `home-study-badge home-study-badge--${badge.variant}`);
    b.textContent = badge.text;
    headline.appendChild(b);
  }

  // title — 빈 doc이면 element 자체를 생략
  const titleHtml = serializeJSONToHTML(item.title);
  let titleEl: HTMLElement | null = null;
  if (titleHtml.trim()) {
    titleEl = el('div', 'home-study-item-title');
    titleEl.innerHTML = titleHtml;
    headline.appendChild(titleEl);
  }

  headerSection.appendChild(headline);

  // description — 빈 doc이면 element 자체를 생략
  const descHtml = serializeJSONToHTML(item.description);
  let descEl: HTMLElement | null = null;
  if (descHtml.trim()) {
    descEl = el('div', 'home-study-item-description');
    descEl.innerHTML = descHtml;
    headerSection.appendChild(descEl);
  }

  // ─ 펼칠 콘텐츠 (LaTeX 포함) — outer(height transition) + inner(padding 고정) 분리
  const contentOuter = el('div', 'home-study-item-content');
  const contentInner = el('div', 'home-study-item-content-inner');
  contentInner.innerHTML = serializeJSONToHTML(item.content);
  contentOuter.appendChild(contentInner);

  // ─ 토글 버튼
  const toggle = el('button', 'home-collapsible-toggle', `펼치기${chevronDownSvg}`);

  root.append(headerSection, contentOuter, toggle);
  parent.appendChild(root);

  // math 렌더
  if (!isCurrent()) return () => {};
  if (titleEl) await renderMath(titleEl);
  if (descEl) await renderMath(descEl);
  await renderMath(contentInner);

  // ─ collapsible 설정
  return setupStudyItemCollapsible(contentOuter, contentInner, toggle);
}

/**
 * Height-기반 collapsible. outer 는 `height: 0` 시작 + transition,
 * inner 는 padding 고정. 펼침 후 `height: auto` 로 해제해 동적 컨텐츠 변화 자동 대응.
 */
function setupStudyItemCollapsible(
  outer: HTMLElement,
  inner: HTMLElement,
  toggle: HTMLButtonElement
): () => void {
  let isOpen = false;

  const handler = () => {
    if (isOpen) {
      // 접기: 현재 높이 명시 → 다음 프레임에 0 → transition
      outer.style.height = `${inner.scrollHeight}px`;
      requestAnimationFrame(() => {
        outer.style.height = '0';
        toggle.innerHTML = `펼치기${chevronDownSvg}`;
      });
    } else {
      // 펼치기: 측정된 높이로 set → transitionend 후 'auto' 로 해제
      outer.style.height = `${inner.scrollHeight}px`;
      toggle.innerHTML = `접기${chevronUpSvg}`;

      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName !== 'height') return;
        outer.removeEventListener('transitionend', onEnd);
        outer.style.height = 'auto';
      };
      outer.addEventListener('transitionend', onEnd);
    }
    isOpen = !isOpen;
  };

  toggle.addEventListener('click', handler);
  return () => toggle.removeEventListener('click', handler);
}
