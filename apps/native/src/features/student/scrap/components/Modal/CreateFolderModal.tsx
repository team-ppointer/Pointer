import React, { useState, useEffect } from 'react';
import { View, Pressable, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { AddFolderScreenModal } from './FullScreenModal';
import { useCreateFolder } from '@/apis';
import { showToast } from './Toast';
import { openImageLibraryWithErrorHandling } from '../../utils/imagePicker';
import { colors } from '@/theme/tokens';
import { useGetPreSignedUrl } from '@/apis/controller/common/postGetPreSignedUrl';
import { uploadImageToS3 } from '../../utils/imageUpload';
import * as ImagePicker from 'expo-image-picker';
import { ImageIcon } from 'lucide-react-native';
import { useScrapModal } from '../../contexts/ScrapModalContext';

export const CreateFolderModal = () => {
  const { isCreateFolderModalVisible, closeCreateFolderModal, refetchFolders, refetchScraps } =
    useScrapModal();
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
    if (!isCreateFolderModalVisible) {
      setFolderName('');
      setSelectedImage(null);
    }
  }, [isCreateFolderModalVisible]);

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
        closeCreateFolderModal();
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
          refetchFolders?.();
          refetchScraps?.();
        },
        (error) => {
          showToast('error', error);
        }
      );

      if (!success) {
        return;
      }
    } else {
      try {
        await createFolder({ name: folderName });
        showToast('success', '폴더가 추가되었습니다.');
        refetchFolders?.();
        setTimeout(() => {
          closeCreateFolderModal();
        }, 0);
      } catch (error) {
        showToast('error', '폴더 추가에 실패했습니다.');
      }
    }
  };

  const handleCancel = () => {
    closeCreateFolderModal();
  };

  return (
    <AddFolderScreenModal
      visible={isCreateFolderModalVisible}
      onCancel={handleCancel}
      onClose={handleCreate}>
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View className='flex-1 items-center gap-[18px] p-[20px] pt-[80px]'>
          <View className='w-[424px] items-center gap-[20px]'>
            <Pressable className='min-w-[136px] items-center p-[10px]' onPress={onPressGallery}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage.uri }}
                  className='h-[136px] w-[136px] rounded-[8px]'
                  resizeMode='cover'
                />
              ) : (
                <View className='bg-primary-500 h-[80px] w-[80px] items-center justify-center rounded-[10px] p-[10px]'>
                  <ImageIcon size={48} color={'#fff'} />
                </View>
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
      </KeyboardAvoidingView>
    </AddFolderScreenModal>
  );
};
