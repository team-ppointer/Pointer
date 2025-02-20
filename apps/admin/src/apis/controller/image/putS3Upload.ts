export interface PutS3UploadParams {
  url: string;
  file: File;
}

const putS3Upload = async ({ url, file }: PutS3UploadParams) => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    return response;
  } catch (error) {
    console.error('Error uploading file to S3 :', error);
  }
};
export default putS3Upload;
