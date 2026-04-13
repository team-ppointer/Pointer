import { useRef, useCallback, useEffect } from 'react';
import type WebView from 'react-native-webview';
import type {
  RNToWebViewMessage,
  WebViewToRNMessage,
  UserAnswer,
  ContentMode,
} from '../types';

interface ContentBridgeOptions {
  initMessage: RNToWebViewMessage & { type: 'init' };
  onReady?: (mode: ContentMode) => void;
  onHeight?: (height: number) => void;
  onComplete?: (answers: UserAnswer[]) => void;
  onBookmark?: (sectionId: string, bookmarked: boolean) => void;
}

export function useContentBridge(options: ContentBridgeOptions) {
  const webViewRef = useRef<WebView>(null);
  const bridgeReadyRef = useRef(false);
  const initMessageRef = useRef(options.initMessage);

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

        switch (msg.type) {
          case 'bridgeReady':
            bridgeReadyRef.current = true;
            injectMessage(initMessageRef.current);
            break;
          case 'ready':
            options.onReady?.(msg.mode);
            break;
          case 'height':
            options.onHeight?.(msg.value);
            break;
          case 'complete':
            options.onComplete?.(msg.answers);
            break;
          case 'bookmark':
            options.onBookmark?.(msg.sectionId, msg.bookmarked);
            break;
        }
      } catch {
        // ignore non-JSON messages
      }
    },
    [options.onReady, options.onHeight, options.onComplete, options.onBookmark, injectMessage],
  );

  const sendToWebView = useCallback(
    (msg: RNToWebViewMessage) => {
      injectMessage(msg);
    },
    [injectMessage],
  );

  return { webViewRef, handleMessage, sendToWebView };
}
