import { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import type { ViewStyle, StyleProp } from 'react-native';
import type { RNToWebViewMessage, UserAnswer, ContentMode } from '../types';
import { useContentBridge } from './useContentBridge';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const contentHtml = require('../../assets/webview/content.html');

interface ContentWebViewProps {
  initMessage: RNToWebViewMessage & { type: 'init' };
  onReady?: (mode: ContentMode) => void;
  onComplete?: (answers: UserAnswer[]) => void;
  onVisibleSection?: (sectionId: string) => void;
  onBookmark?: (sectionId: string, bookmarked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function ContentWebView({
  initMessage,
  onReady,
  onComplete,
  onVisibleSection,
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
    onVisibleSection,
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
        source={contentHtml}
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
