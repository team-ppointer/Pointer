import { getPresignedUrl, putS3Upload } from '@apis';
import { IconButton } from '@components';
import { IcUpload } from '@svg';
import { ImageType } from '@types';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  problemId: string;
  imageType: ImageType;
  imageUrl: string | undefined;
  handleChangeImageUrl: (imageUrl: string) => void;
  handleClickDelete?: () => void;
}

const ImageUpload = ({
  problemId,
  imageType,
  imageUrl,
  handleChangeImageUrl,
  handleClickDelete = () => {
    handleChangeImageUrl('');
  },
}: ImageUploadProps) => {
  const { refetch } = getPresignedUrl({ problemId, imageType });

  const uploadFileToS3 = async (presignedUrl: string, file: File) => {
    try {
      const s3Response = await putS3Upload({ url: presignedUrl, file });
      if (!s3Response) return null;
      if (!s3Response.ok) {
        console.error(
          `S3 Upload Failed for ${file.name}:`,
          s3Response.status,
          s3Response.statusText
        );
        return null;
      }

      return presignedUrl.split('?')[0]; // ✅ 최종 파일 경로 반환
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      return null;
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      console.warn('No files to upload.');
      return;
    }

    try {
      const { data } = await refetch();
      const presignedUrl = data?.data.presignedUrl;

      if (!presignedUrl) {
        console.error('Failed to fetch presigned URL.');
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      const imageUrl = await uploadFileToS3(presignedUrl, file);

      if (imageUrl) {
        handleChangeImageUrl(imageUrl);
      }
    } catch (error) {
      console.error('Error fetching presigned url:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  return (
    <div className='gap[2.4rem] flex w-full flex-col'>
      {imageUrl ? (
        <div className='relative h-[54.3rem] w-full overflow-hidden rounded-[1.6rem]'>
          <img src={imageUrl} alt='upload-image' className='h-full w-full object-cover' />
          <div className='absolute right-[1.6rem] bottom-[1.6rem] z-30 flex items-center gap-[1rem]'>
            <IconButton variant='view' />
            <IconButton variant='delete' onClick={handleClickDelete} />
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`dropzone bg-background flex h-[54.3rem] cursor-pointer items-center justify-center rounded-[1.6rem] ${isDragActive ? 'active-dropzone' : ''}`}>
          <input {...getInputProps()} />
          <div
            className={`flex h-full w-full flex-col items-center justify-center gap-[1.2rem] rounded-[1.6rem] ${isDragActive && 'outline-darkgray100 border-[0.4rem] border-dashed'}`}>
            <IcUpload width={24} height={24} />
            <p className='font-medium-16 text-lightgray500'>
              여기로 이미지를 드래그하거나 파일을 업로드 하세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
