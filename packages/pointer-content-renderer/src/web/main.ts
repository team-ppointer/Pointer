import './core/styles/base.css';
import './modes/document/document.css';
import './modes/chat/chat.css';
import './modes/overview/overview.css';

import type { RNToWebViewMessage } from '../types';

import { onMessage, sendToRN } from './bridge';
import { renderDocument } from './modes/document/document-renderer';
import { runChatScenario } from './modes/chat/chat-controller';
import { renderOverview } from './modes/overview/overview-renderer';
import { initOverviewController, handleBookmarkResult } from './modes/overview/overview-controller';

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
  }
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
      const dispose = await renderDocument(container, msg, isCurrent);
      if (!isCurrent()) return;
      activeDispose = dispose;
      sendToRN({ type: 'ready', mode: 'document' });
      break;
    }

    case 'chat': {
      const abortController = new AbortController();
      activeDispose = () => abortController.abort();
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
          }
        );
        if (!isCurrent()) return;
        sendToRN({ type: 'complete', answers });
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
      await renderOverview(container, msg.sections, isCurrent);
      if (!isCurrent()) return;
      const dispose = initOverviewController(container, msg.sections);
      activeDispose = dispose;
      sendToRN({ type: 'ready', mode: 'overview' });
      break;
    }
  }
});

sendToRN({ type: 'bridgeReady' });

if (import.meta.env.DEV) {
  import('../../dev/dev-panel');
}
