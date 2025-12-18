import { Camera, Image, Images, FolderPlus } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';
import { openCamera, openImageLibrary } from '../../../utils/imagePicker';

export interface AddItemTooltipProps {
  onClose?: () => void;
  onOpenFolderModal?: () => void;
  onOpenQnaImgModal?: () => void;
}

export const AddItemTooltip = ({
  onClose,
  onOpenQnaImgModal,
  onOpenFolderModal,
}: AddItemTooltipProps) => {
  const onPressCamera = async () => {
    const image = await openCamera();
  };

  const onPressGallery = async () => {
    const image = await openImageLibrary();
  };

  return (
    <View className='h-[176px] w-[228px] flex-col rounded-[10px] bg-white'>
      <Pressable
        className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
        onPress={() => onPressCamera()}>
        <Camera size={20} />
        <Text className='text-16r text-black'>사진 찍기</Text>
      </Pressable>
      <Pressable
        className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
        onPress={() => onPressGallery()}>
        <Image size={20} />
        <Text className='text-16r text-black'>이미지 선택</Text>
      </Pressable>
      <Pressable
        className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
        onPress={() => {
          onOpenQnaImgModal?.();
        }}>
        <Images size={20} />
        <Text className='text-16r text-black'>QnA 사진 불러오기</Text>
      </Pressable>
      <Pressable
        className='flex-1 flex-row items-center gap-2 pl-4 pr-[26px]'
        onPress={() => {
          onOpenFolderModal?.();
        }}>
        <FolderPlus size={20} />
        <Text className='text-16r text-black'>폴더 추가하기</Text>
      </Pressable>
    </View>
  );
};
