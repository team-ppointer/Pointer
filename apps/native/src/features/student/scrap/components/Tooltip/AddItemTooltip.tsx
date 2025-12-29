import { Camera, Image, Images, FolderPlus } from 'lucide-react-native';
import { View, Text, Pressable, Alert } from 'react-native';
import {
  openCamera,
  openCameraWithErrorHandling,
  openImageLibrary,
  openImageLibraryWithErrorHandling,
} from '../../utils/imagePicker';
import { useGetPreSignedUrl } from '@/apis/controller/common';
import { useCreateScrapFromImage } from '@/apis';
import { uploadFileToS3 } from '../../utils/s3Upload';
import { uploadImageToS3 } from '../../utils/imageUpload';

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
  const { mutate: getPreSignedUrl } = useGetPreSignedUrl();
  const { mutate: createScrapFromImage } = useCreateScrapFromImage();

  // 이미지 선택 및 업로드 처리
  const handleImageSelect = async (image: any) => {
    if (!image || !image.uri) {
      return;
    }

    await uploadImageToS3(
      image,
      getPreSignedUrl,
      async (result) => {
        // 이미지 기반 스크랩 생성
        createScrapFromImage(
          {
            imageId: result.fileId,
          },
          {
            onSuccess: () => {
              Alert.alert('성공', '스크랩이 생성되었습니다.');
              onClose?.();
            },
            onError: (error) => {
              console.error('스크랩 생성 실패:', error);
              Alert.alert('오류', '스크랩 생성에 실패했습니다.');
            },
          }
        );
      },
      (error) => {
        Alert.alert('오류', error);
      }
    );
  };

  const onPressCamera = async () => {
    const image = await openCameraWithErrorHandling((error) => {
      if (error.message?.includes('permission')) {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      } else {
        console.error('카메라 오류:', error);
      }
    });

    if (image) {
      await handleImageSelect(image);
    }
  };

  // onPressGallery 함수 간소화
  const onPressGallery = async () => {
    const image = await openImageLibraryWithErrorHandling((error) => {
      if (error.message?.includes('permission')) {
        Alert.alert('권한 필요', '갤러리 권한이 필요합니다.');
      } else {
        console.error('갤러리 오류:', error);
      }
    });

    if (image) {
      await handleImageSelect(image);
    }
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
