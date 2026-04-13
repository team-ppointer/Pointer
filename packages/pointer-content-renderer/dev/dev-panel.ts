import { isRNWebView } from '../src/web/bridge';
import type { RNToWebViewMessage } from '../src/types';

import {
  mockDocumentContent,
  mockChatScenario,
  mockOverviewSections,
  mockAllLeftSections,
  mockAllRightSections,
  mockChatResumeAfterQuestion,
  mockChatResumeAfterFirstPointing,
  mockChatResumeMidSecond,
  mockChatResumeAllComplete,
} from './mock-data';

function sendMockMessage(msg: RNToWebViewMessage): void {
  window.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(msg) }));
}

function createDevPanel(): void {
  if (isRNWebView()) return;

  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;bottom:8px;right:8px;z-index:9999;display:flex;gap:6px;';

  const modes = [
    {
      label: '문제(document)',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'document',
          content: mockDocumentContent,
          backgroundColor: '#ffffff',
        }),
    },
    {
      label: '포인팅(chat)',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'chat',
          scenario: mockChatScenario,
        }),
    },
    {
      label: 'chat resume: Q1 answered',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'chat',
          scenario: mockChatScenario,
          userAnswers: mockChatResumeAfterQuestion,
        }),
    },
    {
      label: 'chat resume: P1 done',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'chat',
          scenario: mockChatScenario,
          userAnswers: mockChatResumeAfterFirstPointing,
        }),
    },
    {
      label: 'chat resume: mid P2',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'chat',
          scenario: mockChatScenario,
          userAnswers: mockChatResumeMidSecond,
        }),
    },
    {
      label: 'chat resume: all done',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'chat',
          scenario: mockChatScenario,
          userAnswers: mockChatResumeAllComplete,
        }),
    },
    {
      label: '학습 마무리(overview)',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'overview',
          variant: 'summary',
          sections: mockOverviewSections,
        }),
    },
    {
      label: '포인팅 전체보기 L(overview)',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'overview',
          variant: 'pointing',
          sections: mockAllLeftSections,
        }),
    },
    {
      label: '포인팅 전체보기 R(overview)',
      action: () =>
        sendMockMessage({
          type: 'init',
          mode: 'overview',
          variant: 'pointing',
          sections: mockAllRightSections,
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
