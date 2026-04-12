import { sendToRN } from '../../bridge';

export function initOverviewController(container: HTMLElement): void {
  const observer = new IntersectionObserver(
    (entries) => {
      let mostVisible: { id: string; ratio: number } | null = null;
      for (const entry of entries) {
        const sectionId = (entry.target as HTMLElement).dataset.sectionId;
        if (sectionId && entry.isIntersecting) {
          if (!mostVisible || entry.intersectionRatio > mostVisible.ratio) {
            mostVisible = { id: sectionId, ratio: entry.intersectionRatio };
          }
        }
      }
      if (mostVisible) {
        sendToRN({ type: 'visibleSection', sectionId: mostVisible.id });
      }
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] },
  );

  const sectionEls = container.querySelectorAll<HTMLElement>('.overview-section');
  sectionEls.forEach((el) => observer.observe(el));
}

export function handleScrollToSection(sectionId: string): void {
  const el = document.getElementById(`section-${sectionId}`);
  el?.scrollIntoView({ behavior: 'smooth' });
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
