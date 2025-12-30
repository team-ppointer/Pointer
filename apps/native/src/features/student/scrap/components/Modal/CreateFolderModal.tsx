import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, TextInput } from 'react-native';
import PopUpModal from './PopupModal';
import { useCreateFolder } from '@/apis';
import { showToast } from './Toast';
import { openImageLibraryWithErrorHandling } from '../../utils/imagePicker';
import { colors } from '@/theme/tokens';
import { useGetPreSignedUrl } from '@/apis/controller/common/postGetPreSignedUrl';
import { uploadImageToS3 } from '../../utils/imageUpload';
import * as ImagePicker from 'expo-image-picker';

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  disableBackdropClose?: boolean;
}

export const CreateFolderModal = ({
  visible,
  onClose,
  onSuccess,
  disableBackdropClose = false,
}: CreateFolderModalProps) => {
  const [folderName, setFolderName] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const { mutateAsync: createFolder } = useCreateFolder();
  const { mutate: getPreSignedUrlMutate } = useGetPreSignedUrl();

  // mutate를 래핑하여 uploadImageToS3가 기대하는 형식으로 변환
  const getPreSignedUrl = (
    params: { fileName: string; fileType?: 'IMAGE' | 'DOCUMENT' | 'OTHER' },
    callbacks: {
      onSuccess: (data: {
        uploadUrl: string;
        contentDisposition: string;
        file: { id: number };
      }) => void;
      onError: (error: any) => void;
    }
  ) => {
    getPreSignedUrlMutate(params, {
      onSuccess: (data) => {
        callbacks.onSuccess({
          uploadUrl: data.uploadUrl,
          contentDisposition: data.contentDisposition,
          file: { id: data.file.id },
        });
      },
      onError: callbacks.onError,
    });
  };

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!visible) {
      setFolderName('');
      setSelectedImage(null);
    }
  }, [visible]);

  const onPressGallery = async () => {
    const image = await openImageLibraryWithErrorHandling((error) => {
      if (error.message?.includes('permission')) {
        showToast('error', '갤러리 권한이 필요합니다.');
      } else {
        console.error('갤러리 오류:', error);
        showToast('error', '갤러리를 사용할 수 없습니다.');
      }
    });

    if (image) {
      setSelectedImage(image);
    }
  };

  const handleCreate = async () => {
    if (!folderName.trim()) {
      showToast('error', '폴더 이름을 입력해주세요.');
      return;
    }

    // 이미지가 있는 경우 먼저 업로드
    if (selectedImage) {
      setTimeout(() => {
        onClose();
      }, 0);
      const success = await uploadImageToS3(
        selectedImage,
        getPreSignedUrl,
        async (result) => {
          // 폴더 생성 (이미지 ID 포함)
          await createFolder({
            name: folderName,
            thumbnailImageId: result.fileId,
          });
          showToast('success', '폴더가 추가되었습니다.');
          onSuccess?.();
        },
        (error) => {
          showToast('error', error);
        }
      );

      if (!success) {
        return;
      }
    } else {
      // 이미지가 없는 경우 이름만으로 폴더 생성
      try {
        await createFolder({ name: folderName });
        showToast('success', '폴더가 추가되었습니다.');
        onSuccess?.();
        setTimeout(() => {
          onClose();
        }, 0);
      } catch (error) {
        showToast('error', '폴더 추가에 실패했습니다.');
      }
    }
  };

  const handleCancel = () => {
    setFolderName('');
    setSelectedImage(null);
    onClose();
  };

  return (
    <PopUpModal visibleState={visible} setVisibleState={handleCancel}>
      <View className='min-w-[520px] max-w-[692px] rounded-[20px] border border-gray-400 bg-white shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)]'>
        <View className='flex-row items-center justify-between border-b border-gray-400 px-[20px] py-[12px]'>
          <Pressable onPress={handleCancel} className='min-w-[60px]'>
            <Text className='text-14m text-gray-900'>취소</Text>
          </Pressable>
          <Text className='text-16sb text-gray-900'>새로운 폴더 생성</Text>
          <Pressable onPress={handleCreate} className='min-w-[60px] items-end'>
            <Text className='text-14sb text-blue-500'>완료</Text>
          </Pressable>
        </View>

        <View className='gap-[18px] p-[20px]'>
          <View className='items-center gap-[10px]'>
            <Pressable className='min-w-[136px] items-center p-[10px]' onPress={onPressGallery}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage.uri }}
                  className='h-[136px] w-[136px] rounded-[8px]'
                  resizeMode='cover'
                />
              ) : (
                <View className='h-[136px] w-[136px] bg-lime-50' />
              )}
            </Pressable>
            <View className='w-full rounded-[8px] border border-gray-400 bg-white px-3 py-2'>
              <TextInput
                className='text-16sb text-black'
                placeholder='제목없음'
                placeholderTextColor={colors['gray-500']}
                value={folderName}
                onChangeText={setFolderName}
                autoFocus
              />
            </View>
          </View>
        </View>
      </View>
    </PopUpModal>
  );
};
