import { useMutation } from '@tanstack/react-query';
import { client } from '@apis';
import { components } from '@schema';

type PreSignedReq = components['schemas']['PreSignedReq'];
type PreSignedResp = components['schemas']['PreSignedResp'];
type UploadFileResp = components['schemas']['UploadFileResp'];

type FileToUpload = {
  uri: string;
  name: string;
  type: string;
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

const getPresignedUrls = async (
  fileNames: string[]
): Promise<UploadResult[]> => {
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
  const uploadPromises = files.map((file, index) => {
    const { uploadUrl, contentDisposition } = presignedData[index];

    return fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': contentDisposition,
      },
      body: {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as BodyInit,
    });
  });

  const results = await Promise.all(uploadPromises);
  return results.every((result) => result.ok);
};

const useUploadFile = (options?: Options) => {
  return useMutation({
    mutationFn: async (files: FileToUpload[]) => {
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

