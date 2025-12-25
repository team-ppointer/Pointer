import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, TextInput } from 'react-native';
import PopUpModal from './PopupModal';
import { useCreateFolder } from '@/apis';
import { showToast } from './Toast';
import { openImageLibrary } from '../../utils/imagePicker';
import { colors } from '@/theme/tokens';

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateFolderModal = ({
  visible,
  onClose,
  onSuccess,
}: CreateFolderModalProps) => {
  const [folderName, setFolderName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { mutateAsync: createFolder } = useCreateFolder();

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!visible) {
      setFolderName('');
      setSelectedImage(null);
    }
  }, [visible]);

  const onPressGallery = async () => {
    const image = await openImageLibrary();
    if (image) {
      setSelectedImage(image.uri);
    }
  };

  const handleCreate = async () => {
    if (!folderName.trim()) {
      showToast('error', '폴더 이름을 입력해주세요.');
      return;
    }

    try {
      await createFolder({ name: folderName });
      showToast('success', '폴더가 추가되었습니다.');
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast('error', '폴더 추가에 실패했습니다.');
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
            <Pressable
              className='min-w-[136px] items-center p-[10px]'
              onPress={onPressGallery}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
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

