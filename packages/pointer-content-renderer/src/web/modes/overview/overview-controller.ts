import type { OverviewSection } from '../../../types';
import { setBookmarkButtonState } from './bookmark-icons';

interface TabItem {
  sectionId: string;
  label: string;
  tabEl: HTMLElement;
}

let tabItems: TabItem[] = [];
let activeTabId: string | null = null;

export function initOverviewController(
  container: HTMLElement,
  sections: OverviewSection[],
): () => void {
  tabItems = buildTabItems(sections);
  if (tabItems.length === 0) return () => {};

  const tabBar = createTabBar(tabItems);
  container.insertBefore(tabBar, container.firstChild);

  setActiveTab(tabItems[0].sectionId);

  const tabSectionIds = new Set(tabItems.map((t) => t.sectionId));
  let ticking = false;

  const updateActiveTab = () => {
    const tabBarHeight = getTabBarHeight();
    const threshold = tabBarHeight + 8;
    let closest: { id: string; distance: number } | null = null;

    for (const id of tabSectionIds) {
      const el = document.getElementById(`section-${id}`);
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      if (rect.top <= threshold) {
        const distance = threshold - rect.top;
        if (!closest || distance < closest.distance) {
          closest = { id, distance };
        }
      }
    }

    if (!closest) {
      for (const id of tabSectionIds) {
        const el = document.getElementById(`section-${id}`);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const distance = rect.top - threshold;
        if (distance >= 0 && (!closest || distance < closest.distance)) {
          closest = { id, distance };
        }
      }
    }

    if (closest) {
      setActiveTab(closest.id);
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActiveTab();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', onScroll);
    tabItems = [];
    activeTabId = null;
  };
}

function buildTabItems(sections: OverviewSection[]): TabItem[] {
  const items: TabItem[] = [];
  for (const section of sections) {
    let label: string | null = null;
    if (section.tabLabel) {
      label = section.tabLabel;
    } else if (section.display.type === 'divider' && section.display.text) {
      label = section.display.text;
    }
    if (label) {
      const tabEl = document.createElement('button');
      tabEl.className = 'tab-item';
      tabEl.textContent = label;
      tabEl.dataset.sectionId = section.id;
      tabEl.addEventListener('click', () => scrollToSection(section.id));
      items.push({ sectionId: section.id, label, tabEl });
    }
  }
  return items;
}

function createTabBar(items: TabItem[]): HTMLElement {
  const clip = document.createElement('div');
  clip.className = 'tab-bar-clip';

  const wrapper = document.createElement('div');
  wrapper.className = 'tab-bar-wrapper';

  const bar = document.createElement('nav');
  bar.className = 'tab-bar';
  for (const item of items) {
    bar.appendChild(item.tabEl);
  }

  wrapper.appendChild(bar);
  clip.appendChild(wrapper);
  return clip;
}

function getTabBarHeight(): number {
  const clip = document.querySelector<HTMLElement>('.tab-bar-clip');
  return clip?.offsetHeight ?? 0;
}

function setActiveTab(sectionId: string): void {
  if (activeTabId === sectionId) return;
  activeTabId = sectionId;

  for (const item of tabItems) {
    const isActive = item.sectionId === sectionId;
    item.tabEl.classList.toggle('tab-item--active', isActive);
  }

  const activeItem = tabItems.find((t) => t.sectionId === sectionId);
  activeItem?.tabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function scrollToSection(sectionId: string): void {
  const el = document.getElementById(`section-${sectionId}`);
  if (!el) return;

  const tabBarHeight = getTabBarHeight();
  const elTop = el.getBoundingClientRect().top + window.scrollY - tabBarHeight;
  window.scrollTo({ top: elTop, behavior: 'smooth' });
}

export function handleBookmarkResult(
  sectionId: string,
  attemptedBookmarked: boolean,
  success: boolean,
): void {
  if (success) return;

  const sectionEl = document.getElementById(`section-${sectionId}`);
  if (!sectionEl) return;

  const btn = sectionEl.querySelector<HTMLButtonElement>('.bookmark-btn');
  if (!btn) return;

  // Only rollback if current state still matches the failed attempt.
  // If a newer click already changed the state, that newer request will
  // produce its own result — leave it alone.
  const currentBookmarked = btn.classList.contains('bookmark-btn--active');
  if (currentBookmarked !== attemptedBookmarked) return;

  setBookmarkButtonState(btn, !attemptedBookmarked);
}
