import { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewSource } from 'react-native-webview/lib/WebViewTypes';
import type { ViewStyle, StyleProp, ImageRequireSource } from 'react-native';
import type { RNToWebViewMessage, UserAnswer, ContentMode } from '../types';
import { useContentBridge } from './useContentBridge';

/**
 * Accepts:
 * - `number` (Metro asset id from `require('...')`) — runtime WebView resolves via resolveAssetSource
 * - `{ uri: string }` / `{ html: string }` — standard WebView sources
 */
export type ContentWebViewHtmlSource = WebViewSource | ImageRequireSource;

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
  onBookmark?: (sectionId: string, bookmarked: boolean, requestId: number) => void;
  style?: StyleProp<ViewStyle>;
}

export function ContentWebView({
  htmlSource,
  initMessage,
  onReady,
  onComplete,
  onBookmark,
  style,
}: ContentWebViewProps) {
  const mode = initMessage.mode;
  const isDocument = mode === 'document';
  const [height, setHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { webViewRef, handleMessage } = useContentBridge({
    initMessage,
    onReady: (m) => {
      setIsLoading(false);
      onReady?.(m);
    },
    onHeight: isDocument ? setHeight : undefined,
    onComplete,
    onBookmark,
  });

  const backgroundColor =
    isDocument && initMessage.mode === 'document'
      ? initMessage.backgroundColor ?? '#ffffff'
      : '#f5f5f5';

  return (
    <View
      style={[
        isDocument ? { height, width: '100%' } : { flex: 1 },
        style,
      ]}
    >
      <WebView
        ref={webViewRef}
        source={htmlSource as unknown as WebViewSource}
        onMessage={handleMessage}
        scrollEnabled={!isDocument}
        style={[
          isDocument ? { height, width: '100%' } : { flex: 1 },
          { backgroundColor },
          isLoading ? { opacity: 0 } : { opacity: 1 },
        ]}
        originWhitelist={['*']}
      />
      {isLoading && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}
