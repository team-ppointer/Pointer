import { uploadFileToS3 } from './s3Upload';
import * as ImagePicker from 'expo-image-picker';

/**
 * 이미지 업로드 결과
 */
export interface ImageUploadResult {
  fileId: number;
  uploadUrl: string;
  contentDisposition: string;
}

/**
 * Pre-signed URL 요청 함수 타입
 */
type GetPreSignedUrlFn = (
  params: { fileName: string },
  callbacks: {
    onSuccess: (data: {
      uploadUrl: string;
      contentDisposition: string;
      file: { id: number };
    }) => void;
    onError: (error: any) => void;
  }
) => void;

/**
 * 이미지를 S3에 업로드하는 공통 함수
 * @param image - 업로드할 이미지
 * @param getPreSignedUrl - Pre-signed URL을 요청하는 함수
 * @param onSuccess - 업로드 성공 후 실행할 콜백 (fileId를 받음)
 * @param onError - 에러 발생 시 실행할 콜백
 * @returns Promise<boolean> - 업로드 성공 여부
 */
export const uploadImageToS3 = async (
  image: ImagePicker.ImagePickerAsset,
  getPreSignedUrl: GetPreSignedUrlFn,
  onSuccess: (result: ImageUploadResult) => Promise<void> | void,
  onError?: (error: string) => void
): Promise<boolean> => {
  if (!image || !image.uri) {
    onError?.('이미지가 없습니다.');
    return false;
  }

  try {
    // 파일명 추출 (없으면 기본값 사용)
    const fileName = image.fileName || `image_${Date.now()}.jpg`;

    // Promise로 변환하여 await 가능하게 함
    return await new Promise<boolean>((resolve) => {
      getPreSignedUrl(
        { fileName },
        {
          onSuccess: async (data) => {
            try {
              const { uploadUrl, contentDisposition, file } = data;

              if (!uploadUrl) {
                onError?.('업로드 URL을 받아오지 못했습니다.');
                resolve(false);
                return;
              }

              // S3에 파일 업로드
              const uploadSuccess = await uploadFileToS3(uploadUrl, image.uri, contentDisposition);

              if (!uploadSuccess) {
                onError?.('파일 업로드에 실패했습니다.');
                resolve(false);
                return;
              }

              // 성공 후 처리
              await onSuccess({
                fileId: file.id,
                uploadUrl,
                contentDisposition,
              });

              resolve(true);
            } catch (error) {
              console.error('이미지 업로드 후 처리 실패:', error);
              onError?.('이미지 처리 중 오류가 발생했습니다.');
              resolve(false);
            }
          },
          onError: (error) => {
            console.error('Pre-signed URL 요청 실패:', error);
            onError?.('파일 업로드 준비에 실패했습니다.');
            resolve(false);
          },
        }
      );
    });
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    onError?.('이미지 업로드 중 오류가 발생했습니다.');
    return false;
  }
};
