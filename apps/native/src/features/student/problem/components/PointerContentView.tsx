/**
 * `@repo/pointer-content-renderer` 의 `ContentWebView` 를 감싸는 공용 래퍼.
 *
 * - 4개 화면(ProblemScreen / PointingScreen / AnalysisScreen / AllPointingsScreen)에서
 *   raw `ContentWebView` 를 직접 import 하지 않도록 단일 진입점 역할
 * - HTML 자산(`@assets/webview/content.html`) require 를 일원화
 * - mode 별 기본 style 분기 (document: 정적 높이 자동, 그 외: flex 1)
 * - `forwardRef` 로 `sendBookmarkResult` imperative API 패스스루 (AllPointings bookmark rollback 용)
 */
import {
  ContentWebView,
  type AnswerEventPayload,
  type BookmarkResultArgs,
  type ContentMode,
  type ContentWebViewHandle,
  type RNToWebViewMessage,
  type UserAnswer,
} from '@repo/pointer-content-renderer';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface PointerContentViewHandle {
  sendBookmarkResult: (args: BookmarkResultArgs) => void;
}

interface Props {
  initMessage: RNToWebViewMessage & { type: 'init' };
  onReady?: (mode: ContentMode) => void;
  onComplete?: (answers: UserAnswer[]) => void;
  onAnswer?: (event: AnswerEventPayload) => void;
  onBookmark?: (sectionId: string, bookmarked: boolean, requestId: number) => void;
  style?: StyleProp<ViewStyle>;
  /** Document mode 한정 최소 높이 (px). 그 외 mode 에서는 무시됨. */
  minHeight?: number;
}

export const PointerContentView = forwardRef<PointerContentViewHandle, Props>(
  function PointerContentView(props, ref) {
    const innerRef = useRef<ContentWebViewHandle>(null);

    useImperativeHandle(
      ref,
      () => ({
        sendBookmarkResult: (args) => {
          innerRef.current?.sendBookmarkResult(args);
        },
      }),
      []
    );

    const mode = props.initMessage.mode;
    const defaultStyle: StyleProp<ViewStyle> =
      mode === 'document'
        ? { flex: 0, ...(props.minHeight !== undefined && { minHeight: props.minHeight }) }
        : { flex: 1 };

    return (
      <ContentWebView
        ref={innerRef}
        htmlSource={require('@assets/webview/content.html')}
        initMessage={props.initMessage}
        onReady={props.onReady}
        onAnswer={props.onAnswer}
        onComplete={props.onComplete}
        onBookmark={props.onBookmark}
        style={[defaultStyle, props.style]}
      />
    );
  }
);
