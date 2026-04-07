import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { type components } from '@schema';
import { client } from '@/apis/client';

type PreSignedReq = components['schemas']['PreSignedReq'];
type PreSignedResp = components['schemas']['PreSignedResp'];
type UploadFileResp = components['schemas']['UploadFileResp'];

type FileToUpload = {
  uri: string;
  name: string;
  type: string;
  size?: number;
};

type UploadResult = {
  file: UploadFileResp;
  uploadUrl: string;
  contentDisposition: string;
};

type Options = {
  onSuccess?: (files: UploadFileResp[]) => void;
  onError?: (error: unknown) => void;
};

const getPresignedUrls = async (fileNames: string[]): Promise<UploadResult[]> => {
  const requests: PreSignedReq[] = fileNames.map((fileName) => ({ fileName }));

  const responses = await Promise.all(
    requests.map((req) =>
      client.POST('/api/common/upload-file', {
        body: req,
      })
    )
  );

  return responses.map((response) => {
    if (!response.data) {
      throw new Error('Failed to get presigned URL');
    }
    return {
      file: response.data.file,
      uploadUrl: response.data.uploadUrl,
      contentDisposition: response.data.contentDisposition,
    };
  });
};

const uploadFilesToS3 = async (
  files: FileToUpload[],
  presignedData: UploadResult[]
): Promise<boolean> => {
  const uploadPromises = files.map(async (file, index) => {
    const { uploadUrl, contentDisposition } = presignedData[index];

    // React Native에서 파일 URI를 blob으로 변환
    const response = await fetch(file.uri);
    const blob = await response.blob();

    return fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': contentDisposition,
      },
      body: blob,
    });
  });

  const results = await Promise.all(uploadPromises);
  return results.every((result) => result.ok);
};

const useUploadFile = (options?: Options) => {
  return useMutation({
    mutationFn: async (files: FileToUpload[]) => {
      const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

      for (const file of files) {
        let fileSize = file.size;

        if (!fileSize) {
          try {
            const response = await fetch(file.uri);
            const blob = await response.blob();
            fileSize = blob.size;
          } catch (error) {
            console.error('Failed to get file size', error);
          }
        }

        if (fileSize && fileSize > MAX_UPLOAD_SIZE) {
          Alert.alert('알림', '업로드 최대 용량은 10MB 입니다.');
          throw new Error('File size exceeds 10MB');
        }
      }

      const fileNames = files.map((f) => f.name);
      const presignedData = await getPresignedUrls(fileNames);

      const uploadSuccess = await uploadFilesToS3(files, presignedData);

      if (!uploadSuccess) {
        throw new Error('Failed to upload files to S3');
      }

      return presignedData.map((data) => data.file);
    },
    onSuccess: (files) => {
      options?.onSuccess?.(files);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export default useUploadFile;
export { getPresignedUrls, uploadFilesToS3 };
export type { FileToUpload, UploadResult };
