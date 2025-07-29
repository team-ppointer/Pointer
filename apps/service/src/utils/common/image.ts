import html2canvas from 'html2canvas';
import { RefObject } from 'react';

import { showToast } from '@utils';

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
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } catch (err) {
          console.error('클립보드 복사 실패:', err);
          showToast.error('이미지 복사에 실패했습니다.');
        }
      }
    });
  } catch (error) {
    showToast.error('이미지 복사에 실패했습니다.');
    console.error('이미지 복사 실패:', error);
  }
};
