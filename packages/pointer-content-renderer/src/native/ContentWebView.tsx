import { forwardRef, useImperativeHandle, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewSource } from 'react-native-webview/lib/WebViewTypes';
import type { ViewStyle, StyleProp, ImageRequireSource } from 'react-native';

import type { RNToWebViewMessage, UserAnswer, ContentMode } from '../types';

import { useContentBridge, type AnswerEventPayload } from './useContentBridge';

/**
 * Accepts:
 * - `number` (Metro asset id from `require('...')`) — runtime WebView resolves via resolveAssetSource
 * - `{ uri: string }` / `{ html: string }` — standard WebView sources
 */
export type ContentWebViewHtmlSource = WebViewSource | ImageRequireSource;

/**
 * Arguments for {@link ContentWebViewHandle.sendBookmarkResult}.
 * Mirrors the `bookmarkResult` RN→WebView message payload minus the discriminator.
 */
export type BookmarkResultArgs = Omit<
  Extract<RNToWebViewMessage, { type: 'bookmarkResult' }>,
  'type'
>;

/**
 * Imperative API exposed via `ref` for sending bridge messages to the WebView.
 */
export interface ContentWebViewHandle {
  /**
   * Reply to a `bookmark` event from the WebView. Echo `sectionId`, `bookmarked`,
   * and `requestId` from the originating event; set `success` based on the server
   * mutation result. WebView deduplicates stale replies via `requestId`.
   */
  sendBookmarkResult: (args: BookmarkResultArgs) => void;
  scrollToSection: (sectionId: string) => void;
}

interface ContentWebViewProps {
  /**
   * WebView HTML source. Pass the asset imported from the consumer app:
   *   const contentHtml = require('@assets/webview/content.html');
   *   <ContentWebView htmlSource={contentHtml} ... />
   */
  htmlSource: ContentWebViewHtmlSource;
  initMessage: RNToWebViewMessage & { type: 'init' };
  onReady?: (mode: ContentMode) => void;
  onComplete?: (answers: UserAnswer[]) => void;
  onAnswer?: (event: AnswerEventPayload) => void;
  onBookmark?: (sectionId: string, bookmarked: boolean, requestId: number) => void;
  onAdvance?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ContentWebView = forwardRef<ContentWebViewHandle, ContentWebViewProps>(
  function ContentWebView(
    { htmlSource, initMessage, onReady, onComplete, onAnswer, onBookmark, onAdvance, style },
    ref
  ) {
    const mode = initMessage.mode;
    const isDocument = mode === 'document';
    const [height, setHeight] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const { webViewRef, handleMessage, sendToWebView } = useContentBridge({
      initMessage,
      onReady: (m) => {
        setIsLoading(false);
        onReady?.(m);
      },
      onHeight: isDocument ? setHeight : undefined,
      onComplete,
      onAnswer,
      onBookmark,
      onAdvance,
    });

    useImperativeHandle(
      ref,
      () => ({
        sendBookmarkResult: (args) => {
          sendToWebView({ type: 'bookmarkResult', ...args });
        },
        scrollToSection: (sectionId) => {
          sendToWebView({ type: 'scrollToSection', sectionId });
        },
      }),
      [sendToWebView]
    );

    const backgroundColor =
      isDocument && initMessage.mode === 'document'
        ? (initMessage.backgroundColor ?? '#ffffff')
        : '#f5f5f5';

    return (
      <View style={[isDocument ? { height, width: '100%' } : { flex: 1 }, style]}>
        <WebView
          ref={webViewRef}
          source={htmlSource as unknown as WebViewSource}
          onMessage={handleMessage}
          scrollEnabled={!isDocument}
          bounces={false}
          overScrollMode='never'
          decelerationRate='normal'
          style={[
            isDocument ? { height, width: '100%' } : { flex: 1 },
            { backgroundColor },
            isLoading ? { opacity: 0 } : { opacity: 1 },
          ]}
          originWhitelist={['*']}
        />
        {isLoading && (
          <View
            pointerEvents='none'
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
            }}>
            <ActivityIndicator />
          </View>
        )}
      </View>
    );
  }
);
