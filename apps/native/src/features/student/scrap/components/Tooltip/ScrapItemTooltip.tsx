import { colors } from '@/theme/tokens';
import {
  ArrowRightLeft,
  BookImage,
  BookOpenText,
  FileSymlink,
  FolderOpen,
  ImagePlay,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View, Alert } from 'react-native';
import { showToast } from '../Notification/Toast';
import { ScrapListItemProps } from '../Card/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentRootStackParamList } from '@/navigation/student/types';
import {
  useUpdateScrapName,
  useUpdateFolder,
  useUpdateFolderName,
  useUpdateFolderThumbnail,
  useDeleteScrap,
  useGetScrapDetail,
  useGetFolders,
  useUploadFile,
} from '@/apis';
import { useNoteStore } from '@/features/student/scrap/stores/scrapNoteStore';
import {
  openImageLibrary,
  openImageLibraryWithErrorHandling,
} from '../../utils/images/imagePicker';
import { uploadImageToS3 } from '../../utils/images/imageUpload';
import { usePreSignedUrlAdapter } from '../../hooks';
import { TooltipContainer } from './TooltipContainer';
import { TooltipMenuItem } from './TooltipMenuItem';

export interface ScrapItemTooltipProps {
  props: ScrapListItemProps;
  onClose?: () => void;
  onMovePress?: () => void; // 추가
}

// Backward compatibility
export type ItemTooltipProps = ScrapItemTooltipProps;

export const ScrapItemTooltip = ({ props, onClose, onMovePress }: ScrapItemTooltipProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  const openNote = useNoteStore((state) => state.openNote);

  // API hooks
  const { mutateAsync: updateScrapName } = useUpdateScrapName();
  const { mutateAsync: updateFolderName } = useUpdateFolderName();
  const { mutateAsync: updateFolderThumbnail } = useUpdateFolderThumbnail();
  const { mutateAsync: deleteScrap } = useDeleteScrap();

  // 스크랩 상세 정보 가져오기 (필요한 경우)
  const { data: scrapDetail } = useGetScrapDetail(Number(props.id), props.type === 'SCRAP');
  const { data: foldersData } = useGetFolders();

  const { mutateAsync: uploadFile } = useUploadFile();

  const handleUpdateFolderCover = async (image: any) => {
    if (!image || !image.uri) {
      return;
    }

    if (props.type !== 'FOLDER') {
      return;
    }

    try {
      const fileName = image.fileName || `${Date.now()}.jpg`;
      const files = await uploadFile([
        { uri: image.uri, name: fileName, type: image.mimeType || 'image/jpeg' },
      ]);
      
      await updateFolderThumbnail({
        id: props.id,
        request: {
          thumbnailImageId: files[0].id,
        },
      });
      showToast('success', '표지가 변경되었습니다.');
      handleClose();
    } catch (error) {
      showToast('error', '이미지 업로드에 실패했습니다.');
    }
  };

  const onPressChangeCover = async () => {
    const image = await openImageLibraryWithErrorHandling((error) => {
      if (error.message?.includes('permission')) {
        showToast('error', '갤러리 권한이 필요합니다.');
      } else {
        console.error('갤러리 오류:', error);
        showToast('error', '갤러리를 사용할 수 없습니다.');
      }
    });

    if (image) {
      await handleUpdateFolderCover(image);
    }
  };

  // 초기 제목 설정
  const initialTitle =
    props.type === 'SCRAP'
      ? scrapDetail?.name || props.name
      : foldersData?.data?.find((f) => f.id === props.id)?.name || props.name;

  const [text, setText] = useState(initialTitle);

  const handleClose = () => {
    onClose?.();
  };

  const handleOpenItem = () => {
    handleClose();
    setTimeout(() => {
      if (props.type === 'FOLDER') {
        navigation.push('ScrapContent', { id: props.id });
      } else {
        openNote({ id: props.id, title: props.name });
        navigation.push('ScrapContentDetail', { id: props.id });
      }
    }, 100);
  };

  const handleMove = () => {
    handleClose();
    setTimeout(() => {
      onMovePress?.();
    }, 100);
  };

  const handleDelete = async () => {
    handleClose();

    try {
      await deleteScrap({
        items: [
          {
            id: props.id,
            type: props.type as 'FOLDER' | 'SCRAP',
          },
        ],
      });
      showToast('success', '휴지통으로 이동해 한 달 후 영구 삭제됩니다.');
    } catch (error: any) {
      showToast('error', '삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <TooltipContainer
      height='h-[176px]'
      header={
        <View className='h-[32px] w-[216px] rounded-[6px] bg-gray-300 px-[6px] py-1'>
          <TextInput
            className='text-16m items-center justify-center text-black'
            numberOfLines={1}
            value={text}
            onChangeText={setText}
            onEndEditing={async () => {
              const trimmedText = text.trim();
              if (trimmedText.length > 0 && trimmedText !== initialTitle) {
                try {
                  if (props.type === 'FOLDER') {
                    await updateFolderName({
                      id: props.id,
                      request: { name: trimmedText },
                    });
                  } else {
                    await updateScrapName({
                      scrapId: props.id,
                      request: { name: trimmedText },
                    });
                  }
                  showToast('success', '이름이 변경되었습니다.');
                } catch (error) {
                  showToast('error', '이름 변경에 실패했습니다.');
                  setText(initialTitle);
                }
              }
            }}
          />
        </View>
      }>
      <TooltipMenuItem
        icon={<BookOpenText size={20} />}
        label={props.type === 'FOLDER' ? '폴더 열기' : '스크랩 열기'}
        onPress={handleOpenItem}
      />
      {props.type === 'FOLDER' && (
        <TooltipMenuItem
          icon={<BookImage size={20} />}
          label='표지 변경하기'
          onPress={onPressChangeCover}
        />
      )}
      {props.type === 'SCRAP' && (
        <TooltipMenuItem
          icon={<ArrowRightLeft size={20} />}
          label='폴더 이동하기'
          onPress={handleMove}
        />
      )}
      <TooltipMenuItem
        icon={<Trash2 size={20} color={colors['red-400']} />}
        label='휴지통으로 이동'
        onPress={handleDelete}
        isDangerous
        isLastItem
      />
    </TooltipContainer>
  );
};

// Backward compatibility
export const ItemTooltip = ScrapItemTooltip;
