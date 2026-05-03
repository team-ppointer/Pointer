import './core/styles/base.css';
import './modes/document/document.css';
import './modes/chat/chat.css';
import './modes/overview/overview.css';

import type { RNToWebViewMessage } from '../types';

import { destroyBridge, onMessage, sendToRN } from './bridge';
import { renderDocument } from './modes/document/document-renderer';
import { runChatScenario } from './modes/chat/chat-controller';
import { destroyChatScroll, initChatScroll } from './modes/chat/scroll';
import { renderOverview } from './modes/overview/overview-renderer';
import {
  initOverviewController,
  handleBookmarkResult,
  scrollToSection,
} from './modes/overview/overview-controller';

const container = document.getElementById('content')!;

let activeDispose: (() => void) | null = null;
let currentRenderId = 0;

function disposeCurrentRender(): void {
  currentRenderId++;
  if (activeDispose) {
    activeDispose();
    activeDispose = null;
  }
  container.replaceChildren();
  document.documentElement.style.removeProperty('--content-font-family');
  document.documentElement.style.removeProperty('--content-padding');
  document.body.style.backgroundColor = '';
  document.body.className = '';
}

function handleNonInitMessage(msg: RNToWebViewMessage): void {
  if (msg.type === 'bookmarkResult') {
    handleBookmarkResult(msg.sectionId, msg.bookmarked, msg.requestId, msg.success);
  } else if (msg.type === 'scrollToSection') {
    scrollToSection(msg.sectionId);
  }
}

// 빈 컨테이너만 보내면 RN 측에서 '성공한 빈 콘텐츠'로 인지되므로,
// 사용자에게 실패 사실을 가시화하기 위한 최소 fallback DOM 을 렌더한다.
function renderFallback(): void {
  const el = document.createElement('div');
  el.className = 'content-error';
  el.textContent = '콘텐츠를 불러올 수 없습니다.';
  container.replaceChildren(el);
}

onMessage(async (msg) => {
  if (msg.type !== 'init') {
    handleNonInitMessage(msg);
    return;
  }

  disposeCurrentRender();
  const renderId = currentRenderId;
  const isCurrent = () => renderId === currentRenderId;
  document.body.className = `${msg.mode}-mode`;

  switch (msg.mode) {
    case 'document': {
      try {
        const dispose = await renderDocument(container, msg, isCurrent);
        if (!isCurrent()) return;
        activeDispose = dispose;
      } catch (e) {
        if (!isCurrent()) return;
        console.error('[content-renderer] document render error:', e);
        renderFallback();
      }
      sendToRN({ type: 'ready', mode: 'document' });
      break;
    }

    case 'chat': {
      const abortController = new AbortController();
      initChatScroll();
      activeDispose = () => {
        abortController.abort();
        destroyChatScroll();
      };
      sendToRN({ type: 'ready', mode: 'chat' });
      try {
        const answers = await runChatScenario(
          container,
          msg.scenario,
          msg.userAnswers,
          abortController.signal,
          (ev) => {
            if (!isCurrent()) return;
            sendToRN({
              type: 'answer',
              pointingId: ev.pointingId,
              step: ev.step,
              response: ev.response,
            });
          },
          {
            advanceMessage: msg.advanceMessage,
            advanceButtonLabel: msg.advanceButtonLabel,
          }
        );
        if (!isCurrent()) return;
        sendToRN({ type: 'complete', answers });
        sendToRN({ type: 'advance' });
      } catch (e) {
        if (abortController.signal.aborted) return;
        console.error('[content-renderer] chat error:', e);
      }
      break;
    }

    case 'overview': {
      if (msg.variant) {
        document.body.classList.add(`overview-mode--${msg.variant}`);
      }
      try {
        await renderOverview(container, msg.sections, isCurrent);
        if (!isCurrent()) return;
        const dispose = initOverviewController(container, msg.sections);
        activeDispose = dispose;
      } catch (e) {
        if (!isCurrent()) return;
        console.error('[content-renderer] overview render error:', e);
        renderFallback();
      }
      sendToRN({ type: 'ready', mode: 'overview' });
      break;
    }
  }
});

sendToRN({ type: 'bridgeReady' });

if (import.meta.env.DEV) {
  import('../../dev/dev-panel');
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposeCurrentRender();
    destroyBridge();
  });
}
