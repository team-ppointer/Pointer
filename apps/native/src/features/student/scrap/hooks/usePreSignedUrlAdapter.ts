import { useGetPreSignedUrl } from '@/apis/controller/common/';

/**
 * PreSignedURL mutation을 래핑하여 uploadImageToS3가 기대하는 형식으로 변환하는 훅
 *
 * @returns getPreSignedUrl 함수를 반환
 *
 * @example
 * const getPreSignedUrl = usePreSignedUrlAdapter();
 *
 * await uploadImageToS3(
 *   image,
 *   getPreSignedUrl,
 *   async (result) => { ... },
 *   (error) => { ... }
 * );
 */
export const usePreSignedUrlAdapter = () => {
  const { mutate: getPreSignedUrlMutate } = useGetPreSignedUrl();

  const getPreSignedUrl = (
    params: { fileName: string; fileType?: 'IMAGE' | 'DOCUMENT' | 'OTHER' },
    callbacks: {
      onSuccess: (data: {
        uploadUrl: string;
        contentDisposition: string;
        file: { id: number };
      }) => void;
      onError: (error: any) => void;
    }
  ) => {
    getPreSignedUrlMutate(params, {
      onSuccess: (data) => {
        callbacks.onSuccess({
          uploadUrl: data.uploadUrl,
          contentDisposition: data.contentDisposition,
          file: { id: data.file.id },
        });
      },
      onError: callbacks.onError,
    });
  };

  return getPreSignedUrl;
};
