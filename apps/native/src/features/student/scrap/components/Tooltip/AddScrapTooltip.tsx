import { Camera, Image, Images, FolderPlus } from 'lucide-react-native';
import { Alert } from 'react-native';
import {
  openCameraWithErrorHandling,
  openImageLibraryWithErrorHandling,
} from '../../utils/images/imagePicker';
import { useCreateScrapFromImage, useUploadFile } from '@/apis';
import { TooltipContainer } from './TooltipContainer';
import { TooltipMenuItem } from './TooltipMenuItem';
import { showToast } from '../Notification/Toast';

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
  const { mutateAsync: createScrapFromImage } = useCreateScrapFromImage();
  const { mutateAsync: uploadFile } = useUploadFile();

  // 이미지 선택 및 업로드 처리
  const handleImageSelect = async (image: any) => {
    if (!image || !image.uri) {
      return;
    }
  
    try {
      const fileName = image.fileName || `${Date.now()}.jpg`;
      const files = await uploadFile([
        { uri: image.uri, name: fileName, type: image.mimeType || 'image/jpeg' },
      ]);
  
      await createScrapFromImage({ imageId: files[0].id });
      
      showToast('success', '스크랩이 생성되었습니다.');
      onClose?.();
    } catch (error) {
      showToast('error', (error as any).message || '스크랩 생성에 실패했습니다.');
    }
  };

  const onPressCamera = async () => {
    const image = await openCameraWithErrorHandling((error) => {
      if (error.message?.includes('permission')) {
        showToast('error', '카메라 권한이 필요합니다.');
      } else {
        showToast('error', (error as any).message);
      }
    });

    if (image) {
      await handleImageSelect(image);
    }
  };

  const onPressGallery = async () => {
    const image = await openImageLibraryWithErrorHandling((error) => {
      if (error.message?.includes('permission')) {
        showToast('error', '갤러리 권한이 필요합니다.');
      } else {
        showToast('error', (error as any).message);
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
