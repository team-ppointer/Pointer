import React, { useState, useEffect } from 'react';
import { View, Pressable, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { AddFolderScreenModal } from './FullScreenModal';
import { useCreateFolder, useUploadFile } from '@/apis';
import { showToast } from '../Notification/Toast';
import { openImageLibraryWithErrorHandling } from '../../utils/images/imagePicker';
import { colors } from '@/theme/tokens';
import * as ImagePicker from 'expo-image-picker';
import { ImageIcon } from 'lucide-react-native';
import { useScrapModal } from '../../contexts/ScrapModalsContext';

export const CreateFolderModal = () => {
  const { isCreateFolderModalVisible, closeCreateFolderModal, refetchFolders, refetchScraps } =
    useScrapModal();
  const [folderName, setFolderName] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { mutateAsync: createFolder } = useCreateFolder();
  const { mutateAsync: uploadFile } = useUploadFile();

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

  const handleUploadImage = async () => {
    if (isCreating) {
      return;
    }

    if (!folderName.trim()) {
      showToast('error', '폴더 이름을 입력해주세요.');
      return;
    }

    setIsCreating(true);

      let thumbnailImageId: number | undefined;

      // 이미지가 있는 경우 먼저 업로드
      if (selectedImage) {
        const fileName = selectedImage.fileName || `${Date.now()}.jpg`;
        uploadFile([
          { uri: selectedImage.uri, name: fileName, type: selectedImage.mimeType || 'image/jpeg' },
        ],
        {
          onSuccess: (files) => {
            thumbnailImageId = files[0].id;
            handleCreateFolder(thumbnailImageId ?? undefined);
          },
          onError: (error: any) => {
            showToast('error', error.message);
          },
        }
      );
    }
  };

  const handleCreateFolder = async (thumbnailImageId: number | undefined) => {
    createFolder({
      name: folderName,
      thumbnailImageId: thumbnailImageId ?? undefined,
    },
    {
      onSuccess: () => {
        showToast('success', '폴더가 추가되었습니다.');
        closeCreateFolderModal();
        refetchFolders?.();
        refetchScraps?.();
      },
      onError: (error: any) => {
        showToast('error', error.message);
      },
    }
  );
  setIsCreating(false);
  }

  return (
    <AddFolderScreenModal visible={isCreateFolderModalVisible} onCancel={closeCreateFolderModal} onClose={handleUploadImage}>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View className='flex-1 items-center gap-[18px] p-[20px] pt-[80px]'>
          <View className='w-[320px] items-center gap-[20px] md:w-[424px]'>
            <Pressable className='min-w-[136px] items-center p-[10px]' onPress={onPressGallery}>
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage.uri }}
                  className='h-[136px] w-[136px] rounded-[8px]'
                  resizeMode='cover'
                />
              )}
              {!selectedImage && (
                <View className='bg-primary-500 h-[80px] w-[80px] items-center justify-center rounded-[10px] p-[10px]'>
                  <ImageIcon size={48} color={'#fff'} />
                </View>
              )}
            </Pressable>
            <View className='h-[40px] w-full rounded-[8px] border border-gray-400 bg-white px-3 py-2'>
              <TextInput
                className='text-16sb text-black'
                placeholder='제목없음'
                style={{ lineHeight: 20, paddingVertical: 0 }}
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
