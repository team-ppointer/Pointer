'use client';

import * as React from 'react';
import { Image } from '@tiptap/extension-image';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { recognizeImageWithMathpix, convertMathpixToDollar } from '../../api/imageOCR';
import { focusNextNode, isValidPosition } from '../utils';

import './image-with-ocr.scss';
import { ImageOCRIcon } from '../assets';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OcrApiCall = ((data: any) => Promise<any>) | null;

interface ImageOCRNodeViewProps extends NodeViewProps {
  extension: NodeViewProps['extension'] & {
    options: {
      ocrApiCall?: OcrApiCall;
    };
  };
}

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}>
    <path d='M21 12a9 9 0 1 1-6.219-8.56' />
  </svg>
);

const ImageOCRNodeView: React.FC<ImageOCRNodeViewProps> = (props) => {
  const { node, editor, getPos, extension, selected } = props;
  const { src, alt, title } = node.attrs;
  const ocrApiCall = extension.options.ocrApiCall as OcrApiCall;
  const [loading, setLoading] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  const showOverlay = ocrApiCall && (hovered || selected) && !loading;

  const handleOCR = React.useCallback(async () => {
    if (!ocrApiCall || !src || loading) return;
    setLoading(true);

    try {
      const result = await recognizeImageWithMathpix(src, ocrApiCall);
      const baseText = convertMathpixToDollar(result.text || 'OCR 결과가 없습니다.');

      const pos = getPos();
      if (isValidPosition(pos)) {
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + node.nodeSize })
          .insertContentAt(pos, baseText)
          .run();

        focusNextNode(editor);
      }
    } catch (err) {
      console.error('OCR failed:', err);
      setLoading(false);
    }
  }, [ocrApiCall, src, loading, editor, getPos, node.nodeSize]);

  return (
    <NodeViewWrapper
      className='image-ocr-wrapper'
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <img src={src} alt={alt} title={title} draggable='true' data-drag-handle='' />

      {loading && (
        <div className='image-ocr-loading'>
          <SpinnerIcon className='image-ocr-spinner' />
          <span>OCR 변환 중...</span>
        </div>
      )}

      {showOverlay && (
        <div className='image-ocr-overlay'>
          <button
            type='button'
            className='image-ocr-overlay-button'
            onClick={(e) => {
              e.stopPropagation();
              handleOCR();
            }}
            title='이미지를 텍스트로 변환 (OCR)'>
            <ImageOCRIcon width={16} height={16} />
            <span>텍스트 변환</span>
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export interface ImageWithOCROptions {
  ocrApiCall?: OcrApiCall;
  inline?: boolean;
  allowBase64?: boolean;
  HTMLAttributes?: Record<string, string>;
}

/**
 * Extends the standard Tiptap Image node with a React NodeView that adds
 * an OCR floating button overlay on hover/selection.
 */
export const ImageWithOCR = Image.extend<ImageWithOCROptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      ocrApiCall: null,
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageOCRNodeView);
  },
});
