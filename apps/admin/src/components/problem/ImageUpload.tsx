import { postUploadFile, putS3Upload } from '@apis';
import { IconButton, Modal, TwoButtonModalTemplate } from '@components';
import { useModal } from '@hooks';
import { IcUpload } from '@svg';
import { useDropzone } from 'react-dropzone';
import { components } from '@schema';
import { useState, useEffect } from 'react';

type UploadFileResp = components['schemas']['UploadFileResp'];

interface ImageUploadProps {
  imageUrl: string | undefined;
  imageId?: number;
  handleChangeImageUrl: (imageData: UploadFileResp | undefined) => void;
  handleClickDelete?: () => void;
}

const ImageUpload = ({
  imageUrl,
  imageId: _imageId,
  handleChangeImageUrl,
  handleClickDelete,
}: ImageUploadProps) => {
  const { mutate: mutatePostUploadFile } = postUploadFile();

  // 로컬 상태: 현재 표시할 이미지 URL (업로드/삭제 즉시 반영)
  const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>(imageUrl);

  // imageUrl prop이 변경될 때 로컬 상태 동기화
  useEffect(() => {
    setDisplayImageUrl(imageUrl);
  }, [imageUrl]);

  const {
    isOpen: isViewModalOpen,
    openModal: openViewModal,
    closeModal: closeViewModal,
  } = useModal();

  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const handleDeleteImage = () => {
    setDisplayImageUrl(undefined);
    handleChangeImageUrl(undefined);
    if (handleClickDelete) {
      handleClickDelete();
    }
  };

  const uploadFileToS3 = async (presignedUrl: string, file: File, contentDisposition?: string) => {
    try {
      const s3Response = await putS3Upload({ url: presignedUrl, file, contentDisposition });
      if (!s3Response) return null;
      if (!s3Response.ok) {
        console.error(
          `S3 Upload Failed for ${file.name}:`,
          s3Response.status,
          s3Response.statusText
        );
        return null;
      }

      return presignedUrl.split('?')[0];
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

    const file = acceptedFiles[0];
    if (!file) return;

    try {
      mutatePostUploadFile(
        {
          body: {
            fileName: file.name,
          },
        },
        {
          onSuccess: async (data: {
            file: UploadFileResp;
            contentDisposition: string;
            uploadUrl: string;
          }) => {
            const uploadUrl = data.uploadUrl;
            const fileData = data.file;

            if (!uploadUrl) {
              console.error('Failed to get upload URL.');
              return;
            }

            const uploadResult = await uploadFileToS3(uploadUrl, file, data.contentDisposition);

            if (uploadResult) {
              setDisplayImageUrl(fileData.url);
              handleChangeImageUrl(fileData);
            } else {
              console.error('S3 upload failed');
            }
          },
          onError: (error: unknown) => {
            console.error('Error fetching presigned url:', error);
          },
        }
      );
    } catch (error) {
      console.error('Error in file upload:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  return (
    <div className='flex w-full flex-col gap-600'>
      {displayImageUrl ? (
        <div className='rounded-400 relative h-[54.3rem] w-full overflow-hidden'>
          <img src={displayImageUrl} alt='upload-image' className='h-full w-full object-contain' />
          <div className='absolute right-400 bottom-400 z-30 flex items-center gap-200'>
            <IconButton variant='view' onClick={openViewModal} />
            <IconButton variant='delete' onClick={openDeleteModal} />
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`dropzone bg-background rounded-400 flex h-[54.3rem] cursor-pointer items-center justify-center ${isDragActive ? 'active-dropzone' : ''}`}>
          <input {...getInputProps()} />
          <div
            className={`rounded-400 flex h-full w-full flex-col items-center justify-center gap-300 ${isDragActive && 'outline-darkgray100 border-100 border-dashed'}`}>
            <IcUpload width={24} height={24} />
            <p className='font-medium-16 text-lightgray500'>
              여기로 이미지를 드래그하거나 파일을 업로드 하세요.
            </p>
          </div>
        </div>
      )}
      <Modal isOpen={isViewModalOpen} onClose={closeViewModal}>
        <div className='scrollbar-thin flex max-h-[95dvh] max-w-[95dvw] min-w-[50dvw] items-start justify-start'>
          <img
            src={displayImageUrl}
            alt='uploaded image'
            className='h-full w-full object-contain'
          />
        </div>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='이미지를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={() => {
            closeDeleteModal();
            handleDeleteImage();
          }}
        />
      </Modal>
    </div>
  );
};

export default ImageUpload;
