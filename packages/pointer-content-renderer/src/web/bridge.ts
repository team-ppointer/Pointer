import type { RNToWebViewMessage, WebViewToRNMessage } from '../types';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(data: string): void;
    };
  }
}

type MessageHandler = (msg: RNToWebViewMessage) => void;

let _handler: MessageHandler | null = null;
let _listenerInstalled = false;

function ensureListenerInstalled(): void {
  if (_listenerInstalled || typeof window === 'undefined') return;
  _listenerInstalled = true;

  window.addEventListener('message', (event: MessageEvent) => {
    if (!_handler) return;
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      _handler(data as RNToWebViewMessage);
    } catch {
      // ignore non-JSON messages
    }
  });
}

/**
 * Register the active message handler. Subsequent calls replace the handler
 * without installing a second listener (safe under Vite HMR).
 */
export function onMessage(handler: MessageHandler): void {
  _handler = handler;
  ensureListenerInstalled();
}

export function getHandler(): MessageHandler | null {
  return _handler;
}

export function sendToRN(msg: WebViewToRNMessage): void {
  if (window.ReactNativeWebView?.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  } else if (import.meta.env.DEV) {
    console.log('[bridge → RN]', msg);
  }
}

export function isRNWebView(): boolean {
  return !!window.ReactNativeWebView;
}
