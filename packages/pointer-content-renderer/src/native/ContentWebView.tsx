import { forwardRef, useImperativeHandle, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewSource, ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import type { ViewStyle, StyleProp, ImageRequireSource } from 'react-native';

import type { RNToWebViewMessage, UserAnswer, ContentMode } from '../types';

import { useContentBridge, type AnswerEventPayload } from './useContentBridge';

// RN WebView 의 originWhitelist 미매칭 시 동작은 "차단" 이 아니라 외부 앱
// (Linking) 으로의 fallback 이다. 따라서 originWhitelist 는 통과 layer 로 두고,
// 실제 navigation 정책은 onShouldStartLoadWithRequest 에서 deny-by-default 로
// 강제한다. (CSS/JS subresource 는 originWhitelist 적용 대상이 아니므로
// jsdelivr KaTeX CDN 은 두 layer 어느 쪽에서도 막히지 않고 정상 로드됨.)
const WEBVIEW_ORIGIN_WHITELIST = ['*'];

// dev 빌드의 Metro bundler 자산 (`http://<LAN-IP-or-localhost>:8081/assets/...`)
// 만 좁게 허용. 외부 redirect 는 dev 에서도 차단된다.
const isMetroAssetUrl = (url: string): boolean => {
  if (!__DEV__) return false;
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      parsed.port === '8081' &&
      parsed.pathname.startsWith('/assets/')
    );
  } catch {
    return false;
  }
};

const shouldAllowRequest = (request: ShouldStartLoadRequest): boolean => {
  const { url } = request;

  if (url.startsWith('file://')) return true;
  if (url.startsWith('about:blank')) return true;
  if (isMetroAssetUrl(url)) return true;

  if (__DEV__) console.warn('[ContentWebView] blocked navigation:', url);
  return false;
};

/**
 * 번들된 정적 HTML 자산 또는 inline HTML 만 지원한다.
 * 외부 https URL ({ uri }) 은 의도적으로 받지 않는다 — `originWhitelist` 가
 * 프로덕션에서 file://, about:blank 만 허용하므로 외부 uri 를 넘기면 초기 로드가 차단된다.
 *
 * - `number` (Metro asset id from `require('@assets/webview/content.html')`)
 * - `{ html: string }` — 테스트/스토리북용 inline HTML
 */
export type ContentWebViewHtmlSource = ImageRequireSource | { html: string };

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
          decelerationRate={0.998}
          style={[
            isDocument ? { height, width: '100%' } : { flex: 1 },
            { backgroundColor },
            isLoading ? { opacity: 0 } : { opacity: 1 },
          ]}
          // originWhitelist 는 통과 layer (외부 앱 fallback 방지). 실제 정책은
          // onShouldStartLoadWithRequest 에서 deny-by-default 로 강제한다.
          originWhitelist={WEBVIEW_ORIGIN_WHITELIST}
          onShouldStartLoadWithRequest={shouldAllowRequest}
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
