import { useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import type WebView from 'react-native-webview';

import type { RNToWebViewMessage, WebViewToRNMessage, UserAnswer, ContentMode } from '../types';

export interface AnswerEventPayload {
  pointingId: string;
  step: 'question' | 'confirm';
  response: 'yes' | 'no';
}

interface ContentBridgeOptions {
  initMessage: RNToWebViewMessage & { type: 'init' };
  onReady?: (mode: ContentMode) => void;
  onHeight?: (height: number) => void;
  onComplete?: (answers: UserAnswer[]) => void;
  onAnswer?: (event: AnswerEventPayload) => void;
  onBookmark?: (sectionId: string, bookmarked: boolean, requestId: number) => void;
  onAdvance?: () => void;
}

export function useContentBridge(options: ContentBridgeOptions) {
  const webViewRef = useRef<WebView>(null);
  const bridgeReadyRef = useRef(false);
  const initMessageRef = useRef(options.initMessage);
  // Hold the latest callbacks in a ref so `handleMessage` can stay stable
  // across renders. Without this, callers passing inline arrows (typical)
  // would rebuild `handleMessage` every render and risk WebView reload via
  // the `onMessage` prop changing identity.
  // useLayoutEffect to close the post-commit/pre-effect window where a
  // WebView message arriving between render and effect would otherwise read
  // a stale callback (RN has no SSR concerns).
  const optionsRef = useRef(options);
  useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const injectMessage = useCallback((msg: RNToWebViewMessage) => {
    const js = `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify(msg))}}));true;`;
    webViewRef.current?.injectJavaScript(js);
  }, []);

  // Re-inject init whenever initMessage changes, as long as the bridge is ready.
  useEffect(() => {
    initMessageRef.current = options.initMessage;
    if (bridgeReadyRef.current) {
      injectMessage(options.initMessage);
    }
  }, [options.initMessage, injectMessage]);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg: WebViewToRNMessage = JSON.parse(event.nativeEvent.data);
        const opts = optionsRef.current;

        switch (msg.type) {
          case 'bridgeReady':
            bridgeReadyRef.current = true;
            injectMessage(initMessageRef.current);
            break;
          case 'ready':
            opts.onReady?.(msg.mode);
            break;
          case 'height':
            opts.onHeight?.(msg.value);
            break;
          case 'complete':
            opts.onComplete?.(msg.answers);
            break;
          case 'answer':
            opts.onAnswer?.({
              pointingId: msg.pointingId,
              step: msg.step,
              response: msg.response,
            });
            break;
          case 'bookmark':
            opts.onBookmark?.(msg.sectionId, msg.bookmarked, msg.requestId);
            break;
          case 'advance':
            opts.onAdvance?.();
            break;
        }
      } catch {
        // ignore non-JSON messages
      }
    },
    [injectMessage]
  );

  const sendToWebView = useCallback(
    (msg: RNToWebViewMessage) => {
      injectMessage(msg);
    },
    [injectMessage]
  );

  return { webViewRef, handleMessage, sendToWebView };
}
