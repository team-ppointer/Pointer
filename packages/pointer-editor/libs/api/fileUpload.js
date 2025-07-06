import axios from 'axios';

const baseUrl = 'https://api.math-pointer.com';

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getFileUploadUrl = async ({ fileName }) => {
  const response = await axiosInstance.post('/api/common/upload-file', { fileName });
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

const uploadFileToS3 = async ({ uploadUrl, contentDisposition, file }) => {
  const response = await axiosInstance.put(uploadUrl, file, {
    headers: {
      'Content-Disposition': contentDisposition,
    },
  });
  return response.data;
};

export { getFileUploadUrl, uploadFileToS3 };
