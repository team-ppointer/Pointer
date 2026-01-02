/**
 * S3에 파일을 업로드하는 유틸리티 함수
 * @param uploadUrl - Pre-signed 업로드 URL
 * @param fileUri - 업로드할 파일의 URI (React Native)
 * @param contentDisposition - Content-Disposition 헤더 값
 * @returns 업로드 성공 여부
 */
export const uploadFileToS3 = async (
  uploadUrl: string,
  fileUri: string,
  contentDisposition: string
): Promise<boolean> => {
  try {
    // React Native에서 파일 읽기
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // S3에 PUT 요청
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'content-disposition': contentDisposition,
      },
      body: blob,
    });

    return uploadResponse.ok;
  } catch (error) {
    console.error('S3 업로드 실패:', error);
    return false;
  }
};
