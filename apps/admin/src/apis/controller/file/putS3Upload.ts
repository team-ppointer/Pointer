export interface PutS3UploadParams {
  url: string;
  file: File;
  contentDisposition?: string;
}

const putS3Upload = async ({ url, file, contentDisposition }: PutS3UploadParams) => {
  try {
    console.log('🔗 S3 Upload Details:', {
      url: url.substring(0, 100) + '...',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      contentType: file.type,
    });

    // AWS presigned URL에서 서명된 헤더들을 정확히 맞춰야 함
    // 에러에서 X-Amz-SignedHeaders=content-disposition%3Bhost 확인됨
    const headers: Record<string, string> = {};

    // 1. Content-Disposition 헤더 추가 (서버에서 받은 값 사용)
    if (contentDisposition) {
      headers['content-disposition'] = contentDisposition;
      console.log('📋 Using provided content-disposition:', contentDisposition);
    } else {
      // 빈 값으로라도 포함되어야 함 (서명에 포함되어 있으므로)
      headers['content-disposition'] = '';
      console.log('📋 Using empty content-disposition');
    }

    // 2. Content-Type은 서명에 포함되지 않았으므로 제외
    // if (file.type) {
    //   headers['Content-Type'] = file.type;
    // }

    console.log('🔧 Final request headers:', headers);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: file,
    });

    console.log('📡 S3 Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ S3 Upload Error Response Body:', errorText);
    }

    return response;
  } catch (error) {
    console.error('💥 Error uploading file to S3:', error);
    throw error;
  }
};
export default putS3Upload;
