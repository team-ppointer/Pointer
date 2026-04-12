import { isRNWebView } from '../src/web/bridge';
import {
  mockDocumentContent,
  mockChatScenario,
  mockOverviewSections,
} from './mock-data';
import type { RNToWebViewMessage } from '../src/types';

function sendMockMessage(msg: RNToWebViewMessage): void {
  window.dispatchEvent(
    new MessageEvent('message', { data: JSON.stringify(msg) }),
  );
}

function createDevPanel(): void {
  if (isRNWebView()) return;

  const panel = document.createElement('div');
  panel.style.cssText =
    'position:fixed;top:8px;right:8px;z-index:9999;display:flex;gap:6px;';

  const modes = [
    {
      label: 'Document',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'document',
          content: mockDocumentContent,
          backgroundColor: '#ffffff',
        }),
    },
    {
      label: 'Chat',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'chat',
          scenario: mockChatScenario,
        }),
    },
    {
      label: 'Overview',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'overview',
          sections: mockOverviewSections,
        }),
    },
  ] as const;

  for (const mode of modes) {
    const btn = document.createElement('button');
    btn.textContent = mode.label;
    btn.style.cssText =
      'padding:6px 12px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;font-size:12px;';
    btn.addEventListener('click', () => {
      const content = document.getElementById('content');
      if (content) content.innerHTML = '';
      document.body.className = '';
      mode.action();
    });
    panel.appendChild(btn);
  }

  document.body.appendChild(panel);
}

createDevPanel();
