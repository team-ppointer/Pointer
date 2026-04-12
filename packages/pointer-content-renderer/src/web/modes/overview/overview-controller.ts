import type { OverviewSection } from '../../../types';

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
): void {
  // Build tab bar
  tabItems = buildTabItems(sections);
  if (tabItems.length === 0) return;

  const tabBar = createTabBar(tabItems);
  container.insertBefore(tabBar, container.firstChild);

  // Activate first tab
  if (tabItems.length > 0) {
    setActiveTab(tabItems[0].sectionId);
  }

  // IntersectionObserver for scroll → tab sync
  const tabSectionIds = new Set(tabItems.map((t) => t.sectionId));
  const observer = new IntersectionObserver(
    (entries) => {
      // Find the topmost visible tab-target section
      let topMost: { id: string; top: number } | null = null;
      for (const entry of entries) {
        const sectionId = (entry.target as HTMLElement).dataset.sectionId;
        if (!sectionId || !tabSectionIds.has(sectionId)) continue;
        if (!entry.isIntersecting) continue;

        const top = entry.boundingClientRect.top;
        if (!topMost || top < topMost.top) {
          topMost = { id: sectionId, top };
        }
      }
      if (topMost) {
        setActiveTab(topMost.id);
      }
    },
    {
      rootMargin: `-${getTabBarHeight()}px 0px 0px 0px`,
      threshold: [0, 0.1],
    },
  );

  const sectionEls = container.querySelectorAll<HTMLElement>('.overview-section');
  sectionEls.forEach((el) => observer.observe(el));
}

function buildTabItems(sections: OverviewSection[]): TabItem[] {
  const items: TabItem[] = [];
  for (const section of sections) {
    let label: string | null = null;
    if (section.label) {
      label = section.label;
    } else if (section.display.type === 'divider') {
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
  const bar = document.createElement('nav');
  bar.className = 'tab-bar';
  for (const item of items) {
    bar.appendChild(item.tabEl);
  }
  return bar;
}

function getTabBarHeight(): number {
  const bar = document.querySelector<HTMLElement>('.tab-bar');
  return bar?.offsetHeight ?? 0;
}

function setActiveTab(sectionId: string): void {
  if (activeTabId === sectionId) return;
  activeTabId = sectionId;

  for (const item of tabItems) {
    const isActive = item.sectionId === sectionId;
    item.tabEl.classList.toggle('tab-item--active', isActive);
  }

  // Scroll active tab into view in the tab bar
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

export function handleBookmarkResult(sectionId: string, success: boolean): void {
  if (success) return;

  const sectionEl = document.getElementById(`section-${sectionId}`);
  if (!sectionEl) return;

  const btn = sectionEl.querySelector<HTMLButtonElement>('.bookmark-btn');
  if (!btn) return;

  const isActive = btn.classList.contains('bookmark-btn--active');
  btn.classList.toggle('bookmark-btn--active', !isActive);
  btn.classList.toggle('bookmark-btn--inactive', isActive);
  btn.textContent = !isActive ? '★' : '☆';
}
