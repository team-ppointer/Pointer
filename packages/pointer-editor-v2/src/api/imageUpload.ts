import axios, { type AxiosProgressEvent } from 'axios';

const baseUrl = 'https://dev.api.math-pointer.com';

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getFileUploadUrl = async ({
  fileName,
  signal,
}: {
  fileName: string;
  signal?: AbortSignal;
}) => {
  const response = await axiosInstance.post('/api/common/upload-file', { fileName }, { signal });
  return response.data;
  // example response
  /*
    {
        "file": {
            "id": 0,
            "fileName": "string",
            "url": "string"
        },
        "contentDisposition": "string",
        "uploadUrl": "string"
    }
    */
};

const uploadFileToS3 = async ({
  uploadUrl,
  contentDisposition,
  file,
  onUploadProgress,
  signal,
}: {
  uploadUrl: string;
  contentDisposition: string;
  file: File;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  signal?: AbortSignal;
}) => {
  const response = await axiosInstance.put(uploadUrl, file, {
    headers: {
      'Content-Disposition': contentDisposition,
    },
    onUploadProgress,
    signal,
  });
  return response.data;
};

export { getFileUploadUrl, uploadFileToS3 };
