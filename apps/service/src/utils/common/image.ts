/* eslint-disable @typescript-eslint/no-unused-vars */
import html2canvas from 'html2canvas';
import { RefObject } from 'react';

import { showToast } from '@utils';

/**
 * iOS 환경인지 확인하는 함수
 * @returns boolean
 */
const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
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
    const images = ref.current.querySelectorAll('img');
    images.forEach((img) => {
      img.crossOrigin = 'anonymous';
    });

    const canvas = await html2canvas(ref.current, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: true,
      // CORS 문제 해결을 위한 추가 옵션
      foreignObjectRendering: false,
      imageTimeout: 0,
    });

    const dataURL = canvas.toDataURL('image/png');

    const response = await fetch(dataURL);
    const blob = await response.blob();

    try {
      // Clipboard API 지원 확인
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast.success('문제가 복사되었습니다.');
      } else {
        if (isIOS()) {
          showToast.error('iOS에서는 이미지를 길게 눌러 복사해주세요.');
        } else {
          showToast.error('클립보드 복사를 지원하지 않는 브라우저입니다.');
        }
      }
    } catch (error) {
      console.error('Clipboard API error:', error);
      if (isIOS()) {
        showToast.error('iOS에서는 이미지를 길게 눌러 복사해주세요.');
      } else {
        showToast.error('문제 복사에 실패했습니다.');
      }
    }
  } catch (error) {
    console.error('Image copy error:', error);
    showToast.error('문제 복사에 실패했습니다.');
  }
};
