import { useRef, useCallback } from 'react';
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
  onVisibleSection?: (sectionId: string) => void;
  onBookmark?: (sectionId: string, bookmarked: boolean) => void;
}

export function useContentBridge(options: ContentBridgeOptions) {
  const webViewRef = useRef<WebView>(null);
  const initSentRef = useRef(false);

  const injectMessage = useCallback((msg: RNToWebViewMessage) => {
    const js = `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify(msg))}}));true;`;
    webViewRef.current?.injectJavaScript(js);
  }, []);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg: WebViewToRNMessage = JSON.parse(event.nativeEvent.data);

        switch (msg.type) {
          case 'ready':
            if (!initSentRef.current) {
              initSentRef.current = true;
              injectMessage(options.initMessage);
            }
            options.onReady?.(msg.mode);
            break;
          case 'height':
            options.onHeight?.(msg.value);
            break;
          case 'complete':
            options.onComplete?.(msg.answers);
            break;
          case 'visibleSection':
            options.onVisibleSection?.(msg.sectionId);
            break;
          case 'bookmark':
            options.onBookmark?.(msg.sectionId, msg.bookmarked);
            break;
        }
      } catch {
        // ignore non-JSON messages
      }
    },
    [options.initMessage, options.onReady, options.onHeight, options.onComplete, options.onVisibleSection, options.onBookmark, injectMessage],
  );

  const sendToWebView = useCallback(
    (msg: RNToWebViewMessage) => {
      injectMessage(msg);
    },
    [injectMessage],
  );

  return { webViewRef, handleMessage, sendToWebView };
}
