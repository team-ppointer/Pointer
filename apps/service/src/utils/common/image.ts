/* eslint-disable @typescript-eslint/no-unused-vars */
import html2canvas from 'html2canvas';
import { RefObject } from 'react';

import { showToast } from '@utils';

/**
 * 모바일 환경인지 확인하는 함수
 * @returns boolean
 */
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * 이미지를 클립보드에 복사하는 함수
 * @param ref 복사할 이미지의 ref
 * @returns Promise<void>
 */
export const copyImageToClipboard = async (
  ref: RefObject<HTMLDivElement | null>
): Promise<void> => {
  if (!ref.current) return;

  try {
    const canvas = await html2canvas(ref.current, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      backgroundColor: '#ffffff',
    });

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          // Clipboard API 지원 확인
          if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast.success('문제가 복사되었습니다.');
          } else {
            showToast.error('클립보드 복사를 지원하지 않는 브라우저입니다.');
          }
        } catch (error) {
          console.error('Clipboard API error:', error);
          showToast.error('문제 복사에 실패했습니다.');
        }
      }
    });
  } catch (error) {
    console.error('Image copy error:', error);
    showToast.error('문제 복사에 실패했습니다.');
  }
};
