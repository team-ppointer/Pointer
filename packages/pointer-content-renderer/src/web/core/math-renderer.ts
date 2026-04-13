declare global {
  interface Window {
    katex?: {
      render(
        latex: string,
        element: HTMLElement,
        options?: { throwOnError?: boolean; displayMode?: boolean },
      ): void;
    };
    /** Set by index.html <script onload> when KaTeX finishes loading. */
    __katexLoaded?: boolean;
    /** Set by index.html <script onerror> when KaTeX fails to load. */
    __katexFailed?: boolean;
  }
}

const KATEX_LOAD_TIMEOUT_MS = 8000;

type KaTeX = NonNullable<Window['katex']>;

function waitForKaTeX(): Promise<KaTeX | null> {
  // Fast paths — resolve synchronously
  if (window.katex) return Promise.resolve(window.katex);
  if (window.__katexFailed) return Promise.resolve(null);

  const script = document.querySelector<HTMLScriptElement>('script[src*="katex"]');
  if (!script) return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value: KaTeX | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    // Re-check on each microtask boundary in case load/error already fired
    if (window.__katexLoaded) {
      settle(window.katex ?? null);
      return;
    }
    if (window.__katexFailed) {
      settle(null);
      return;
    }

    script.addEventListener(
      'load',
      () => settle(window.katex ?? null),
      { once: true },
    );
    script.addEventListener('error', () => settle(null), { once: true });

    // Timeout fallback for slow/offline CDN
    window.setTimeout(() => settle(window.katex ?? null), KATEX_LOAD_TIMEOUT_MS);
  });
}

export async function renderMath(container: HTMLElement): Promise<void> {
  // Skip KaTeX wait entirely if there's nothing to render
  const spans = container.querySelectorAll<HTMLElement>('span[data-type="inline-math"]');
  if (spans.length === 0) return;

  const katex = await waitForKaTeX();

  spans.forEach((el) => {
    if (el.childElementCount > 0) return;

    const latex = el.getAttribute('data-latex') || '';
    if (!katex) {
      // KaTeX unavailable — fall back to raw LaTeX text
      el.textContent = latex;
      return;
    }

    try {
      katex.render(latex, el, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      el.textContent = latex;
    }
  });
}
