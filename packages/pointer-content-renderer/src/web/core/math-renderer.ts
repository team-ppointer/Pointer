declare global {
  interface Window {
    katex?: {
      render(
        latex: string,
        element: HTMLElement,
        options?: { throwOnError?: boolean; displayMode?: boolean },
      ): void;
    };
  }
}

function waitForKaTeX(): Promise<NonNullable<Window['katex']>> {
  if (window.katex) return Promise.resolve(window.katex);

  return new Promise((resolve) => {
    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="katex"]',
    );
    if (!script) return;

    script.addEventListener('load', () => {
      if (window.katex) resolve(window.katex);
    });
  });
}

export async function renderMath(container: HTMLElement): Promise<void> {
  const katex = await waitForKaTeX();
  const spans = container.querySelectorAll<HTMLElement>(
    'span[data-type="inline-math"]',
  );

  spans.forEach((el) => {
    if (el.childElementCount > 0) return;

    const latex = el.getAttribute('data-latex') || '';
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
