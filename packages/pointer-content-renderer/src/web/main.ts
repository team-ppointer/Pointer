import './core/styles/base.css';
import './modes/document/document.css';
import './modes/chat/chat.css';
import './modes/overview/overview.css';

import { onMessage, sendToRN } from './bridge';
import { renderDocument } from './modes/document/document-renderer';
import { runChatScenario } from './modes/chat/chat-controller';
import { renderOverview } from './modes/overview/overview-renderer';
import {
  initOverviewController,
  handleBookmarkResult,
} from './modes/overview/overview-controller';
import type { RNToWebViewMessage } from '../types';

const container = document.getElementById('content')!;

function handleNonInitMessage(msg: RNToWebViewMessage): void {
  if (msg.type === 'bookmarkResult') {
    handleBookmarkResult(msg.sectionId, msg.success);
  }
}

onMessage(async (msg) => {
  if (msg.type !== 'init') {
    handleNonInitMessage(msg);
    return;
  }

  // Reset inline styles from previous mode
  document.documentElement.style.removeProperty('--content-font-family');
  document.body.style.backgroundColor = '';
  document.body.className = `${msg.mode}-mode`;

  switch (msg.mode) {
    case 'document':
      await renderDocument(container, msg);
      sendToRN({ type: 'ready', mode: 'document' });
      break;

    case 'chat': {
      sendToRN({ type: 'ready', mode: 'chat' });
      const answers = await runChatScenario(container, msg.scenario);
      sendToRN({ type: 'complete', answers });
      break;
    }

    case 'overview':
      if (msg.variant) {
        document.body.classList.add(`overview-mode--${msg.variant}`);
      }
      await renderOverview(container, msg.sections);
      initOverviewController(container, msg.sections);
      sendToRN({ type: 'ready', mode: 'overview' });
      break;
  }
});

// Notify RN that the message listener is ready to receive init
sendToRN({ type: 'bridgeReady' });

if (import.meta.env.DEV) {
  import('../../dev/dev-panel');
}
