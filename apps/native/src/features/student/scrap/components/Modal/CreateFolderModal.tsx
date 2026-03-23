import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import type * as ImagePicker from 'expo-image-picker';
import { ImageIcon } from 'lucide-react-native';

import { useCreateFolder, useUploadFile } from '@/apis';
import { colors } from '@/theme/tokens';

import { showToast } from '../Notification/Toast';
import { openImageLibraryWithErrorHandling } from '../../utils/images/imagePicker';
import { useScrapModal } from '../../contexts/ScrapModalsContext';

import { AddFolderScreenModal } from './FullScreenModal';

export const CreateFolderModal = () => {
  const { isCreateFolderModalVisible, closeCreateFolderModal, refetchFolders, refetchScraps } =
    useScrapModal();
  const [folderName, setFolderName] = useState('제목 없음');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageId, setImageId] = useState<number | null>(null);
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

  const handleUploadImage = async (): Promise<number | null> => {
    // 이미지가 있는 경우 먼저 업로드
    if (selectedImage) {
      const fileName = selectedImage.fileName || `${Date.now()}.jpg`;
      try {
        const files = await uploadFile([
          { uri: selectedImage.uri, name: fileName, type: selectedImage.mimeType || 'image/jpeg' },
        ]);
        return files[0].id;
      } catch (error: unknown) {
        console.log('error', error instanceof Error ? error.message : error);
      }
    }
    return null;
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      showToast('error', '폴더 이름을 입력해주세요.');
      return;
    }

    setIsCreating(true);

    try {
      // 이미지 업로드가 완료될 때까지 대기
      const uploadedImageId = await handleUploadImage();

      // 폴더 생성
      await createFolder({
        name: folderName,
        thumbnailImageId: uploadedImageId ?? undefined,
      });

      closeCreateFolderModal();
      refetchFolders?.();
      refetchScraps?.();
      setTimeout(() => {
        showToast('success', '폴더가 추가되었습니다.');
      }, 0);
    } catch (error: unknown) {
      showToast('error', error instanceof Error ? error.message : '폴더 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 자동으로 포커스
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // 약간의 지연을 주어 화면 렌더링이 완료된 후 포커스

    return () => clearTimeout(timer);
  }, []);

  return (
    <AddFolderScreenModal
      visible={isCreateFolderModalVisible}
      onCancel={closeCreateFolderModal}
      onClose={() => {
        if (!isCreating) {
          handleCreateFolder();
        }
      }}>
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
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
            <View className='h-[40px] w-full rounded-[8px] border border-gray-500 bg-gray-200 px-3'>
              <TextInput
                ref={inputRef}
                className='text-16sb flex-1 text-black'
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
