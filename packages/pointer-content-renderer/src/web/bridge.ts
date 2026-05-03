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
let _installedListener: ((event: MessageEvent) => void) | null = null;

function dispatchMessage(event: MessageEvent): void {
  if (!_handler) return;
  try {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    _handler(data as RNToWebViewMessage);
  } catch {
    // ignore non-JSON messages
  }
}

function ensureListenerInstalled(): void {
  if (_installedListener || typeof window === 'undefined') return;
  _installedListener = dispatchMessage;
  window.addEventListener('message', _installedListener);
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

/**
 * Detach the message listener and clear the handler. Safe to call multiple
 * times. Use this when the WebView is unmounted or the bundle is being
 * torn down (e.g., Vite HMR) to prevent listener accumulation.
 */
export function destroyBridge(): void {
  if (_installedListener && typeof window !== 'undefined') {
    window.removeEventListener('message', _installedListener);
  }
  _installedListener = null;
  _handler = null;
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
