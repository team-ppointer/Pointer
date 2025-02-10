import { IconButton } from '@components';
import { IcUpload } from '@svg';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  label: string;
}

const ImageUpload = ({ label }: ImageUploadProps) => {
  const [imageUrl, setImageUrl] = useState('');

  const onDrop = async (acceptedFiles: File[]) => {
    // const newPhotos = acceptedFiles.map((file) => URL.createObjectURL(file));
    setImageUrl(
      'https://pickple-bucket.s3.ap-northeast-2.amazonaws.com/moim/659607c8-91f9-4be2-b5ad-b7c9ddf157f1.jpg'
    );

    for (const file of acceptedFiles) {
      try {
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  return (
    <div>
      <h3 className='font-medium-24 text-black'>{label}</h3>
      {imageUrl ? (
        <div className='relative h-[54.3rem] w-full overflow-hidden rounded-[1.6rem]'>
          <img src={imageUrl} alt='upload-image' className='h-full w-full object-cover' />
          <div className='absolute right-[1.6rem] bottom-[1.6rem] z-30 flex items-center gap-[1rem]'>
            <IconButton variant='view' />
            <IconButton variant='delete' />
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`dropzone bg-background mt-[2.4rem] flex h-[54.3rem] min-w-[72.4rem] cursor-pointer items-center justify-center rounded-[1.6rem] ${isDragActive ? 'active-dropzone' : ''}`}>
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
