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

export function onMessage(handler: MessageHandler): void {
  _handler = handler;

  window.addEventListener('message', (event: MessageEvent) => {
    try {
      const data =
        typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      handler(data as RNToWebViewMessage);
    } catch {
      // ignore non-JSON messages
    }
  });
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
