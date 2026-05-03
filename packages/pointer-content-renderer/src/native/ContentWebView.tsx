import { forwardRef, useImperativeHandle, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewSource, ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import type { ViewStyle, StyleProp, ImageRequireSource } from 'react-native';

import type { RNToWebViewMessage, UserAnswer, ContentMode } from '../types';

import { useContentBridge, type AnswerEventPayload } from './useContentBridge';

// 번들된 정적 HTML 만 로드. 외부 origin 으로의 navigation 은 모두 차단.
// (CSS/JS subresource 는 originWhitelist 적용 대상이 아니므로 jsdelivr KaTeX CDN 은 정상 로드됨.)
//
// dev 모드에서는 Metro bundler 가 require('./*.html') 자산을
// `http://<LAN-IP>:8081/...` 로 서빙하므로 http/https 도 허용해야 한다.
// 프로덕션 번들에서는 file:// 만 허용.
const ALLOWED_ORIGIN_WHITELIST = __DEV__
  ? ['file://', 'about:blank', 'http://', 'https://']
  : ['file://', 'about:blank'];

const shouldAllowRequest = (request: ShouldStartLoadRequest): boolean => {
  const url = request.url;
  if (url.startsWith('file://')) return true;
  if (url.startsWith('about:blank')) return true;
  // dev 빌드: Metro 가 어떤 host (LAN IP / localhost) 로 서빙되든 허용.
  // 프로덕션에서는 file:// 만 통과되므로 보안 가드 유지.
  // data: navigation 은 의도적으로 차단 — 임의 HTML/JS 실행 우회 경로가 됨.
  // (injectedJavaScript / postMessage 는 navigation 이 아니라 영향 없음.)
  if (__DEV__ && (url.startsWith('http://') || url.startsWith('https://'))) {
    return true;
  }
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
          // 정적 번들 HTML + 신뢰된 CDN(jsdelivr KaTeX) 만 사용. 외부 navigation 차단.
          originWhitelist={ALLOWED_ORIGIN_WHITELIST}
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
