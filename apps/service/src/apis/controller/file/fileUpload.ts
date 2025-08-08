import { client } from '@/apis/client';

const getFileUploadUrl = async (fileName: string[]) => {
  const urlPromises = fileName.map((name) =>
    client.POST('/api/common/upload-file', {
      body: {
        fileName: name,
      },
    })
  );

  const responses = await Promise.all(urlPromises);
  const uploadUrls = responses.map((response) => {
    if (!response.data || !response.data.uploadUrl) {
      throw new Error('Invalid response data');
    }
    return {
      uploadUrl: response.data.uploadUrl,
      fileName: response.data.file,
      contentDisposition: response.data.contentDisposition,
      id: response.data.file.id,
    };
  });

  return uploadUrls;
};

const uploadFileToS3 = async (
  file: File[],
  uploadUrls: { uploadUrl: string; fileName: string; id: number; contentDisposition: string }[]
) => {
  const uploadPromises = file.map((f, index) => {
    return fetch(uploadUrls[index].uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': f.type,
        'Content-Disposition': uploadUrls[index].contentDisposition,
      },
      body: f,
    });
  });

  const results = await Promise.all(uploadPromises);
  const isSuccess = results.every((result) => result.ok);

  return isSuccess;
};

export { getFileUploadUrl, uploadFileToS3 };
