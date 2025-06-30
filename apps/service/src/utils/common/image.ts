import { toast } from 'react-toastify';

/**
 * 이미지를 클립보드에 복사하는 함수
 * @param imageUrl 복사할 이미지의 URL
 * @returns Promise<void>
 */
export const copyImageToClipboard = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;

  try {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('이미지를 변환하는 데 실패했습니다.');
          return;
        }

        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          toast.success('이미지가 클립보드에 복사되었어요.');
        } catch (err) {
          console.error('이미지 복사 실패:', err);
          toast.error('이미지 복사에 실패했습니다.');
        }
      }, 'image/png');
    };

    img.onerror = () => {
      toast.error('이미지를 불러오는 데 실패했습니다.');
    };
  } catch (error) {
    console.error('이미지 처리 실패:', error);
    toast.error('이미지 복사에 실패했습니다.');
  }
};
