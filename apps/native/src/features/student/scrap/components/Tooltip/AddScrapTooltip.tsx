import { Camera, Image, Images, FolderPlus } from 'lucide-react-native';
import { Alert } from 'react-native';
import {
  openCamera,
  openCameraWithErrorHandling,
  openImageLibrary,
  openImageLibraryWithErrorHandling,
} from '../../utils/images/imagePicker';
import { useCreateScrapFromImage } from '@/apis';
import { uploadImageToS3 } from '../../utils/images/imageUpload';
import { usePreSignedUrlAdapter } from '../../hooks';
import { TooltipContainer } from './TooltipContainer';
import { TooltipMenuItem } from './TooltipMenuItem';

export interface AddScrapTooltipProps {
  onClose?: () => void;
  onOpenFolderModal?: () => void;
  onOpenQnaImgModal?: () => void;
}

// Backward compatibility
export type AddItemTooltipProps = AddScrapTooltipProps;

export const AddScrapTooltip = ({
  onClose,
  onOpenQnaImgModal,
  onOpenFolderModal,
}: AddScrapTooltipProps) => {
  const { mutate: createScrapFromImage } = useCreateScrapFromImage();
  const getPreSignedUrl = usePreSignedUrlAdapter();

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
    <TooltipContainer height='h-[176px]'>
      <TooltipMenuItem icon={<Camera size={20} />} label='사진 찍기' onPress={onPressCamera} />
      <TooltipMenuItem icon={<Image size={20} />} label='이미지 선택' onPress={onPressGallery} />
      <TooltipMenuItem
        icon={<Images size={20} />}
        label='QnA 사진 불러오기'
        onPress={() => onOpenQnaImgModal?.()}
      />
      <TooltipMenuItem
        icon={<FolderPlus size={20} />}
        label='폴더 추가하기'
        onPress={() => onOpenFolderModal?.()}
        isLastItem
      />
    </TooltipContainer>
  );
};

// Backward compatibility
export const AddItemTooltip = AddScrapTooltip;
