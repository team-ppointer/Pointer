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
import { TextInput, View, Text, Pressable, Alert } from 'react-native';
import { showToast } from '../Modal/Toast';
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
} from '@/apis';
import { useNoteStore } from '@/stores/scrapNoteStore';
import { useGetPreSignedUrl } from '@/apis/controller/common/postGetPreSignedUrl';
import { openImageLibrary, openImageLibraryWithErrorHandling } from '../../utils/imagePicker';
import { uploadImageToS3 } from '../../utils/imageUpload';

export interface ItemTooltipProps {
  props: ScrapListItemProps;
  onClose?: () => void;
  onMovePress?: () => void; // 추가
}

export const ItemTooltip = ({ props, onClose, onMovePress }: ItemTooltipProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  const openNote = useNoteStore((state) => state.openNote);

  // API hooks
  const { mutateAsync: updateScrapName } = useUpdateScrapName();
  const { mutateAsync: updateFolder } = useUpdateFolder();
  const { mutateAsync: updateFolderName } = useUpdateFolderName();
  const { mutateAsync: updateFolderThumbnail } = useUpdateFolderThumbnail();
  const { mutateAsync: deleteScrap } = useDeleteScrap();

  // 스크랩 상세 정보 가져오기 (필요한 경우)
  const { data: scrapDetail } = useGetScrapDetail(Number(props.id), props.type === 'SCRAP');
  const { data: foldersData } = useGetFolders();

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

  const handleUpdateFolderCover = async (image: any) => {
    if (!image || !image.uri) {
      return;
    }

    if (props.type !== 'FOLDER') {
      return;
    }

    await uploadImageToS3(
      image,
      getPreSignedUrl,
      async (result) => {
        // 폴더 썸네일만 업데이트
        await updateFolderThumbnail({
          id: props.id,
          request: {
            thumbnailImageId: result.fileId,
          },
        });
        showToast('success', '표지가 변경되었습니다.');
        handleClose();
      },
      (error) => {
        showToast('error', error);
      }
    );
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

  return (
    <View className='h-[176px] w-[228px] flex-col rounded-[10px] bg-white'>
      <View className='h-[44px] items-center justify-center gap-2 border-b-[0.5px] border-gray-500 px-[6px]'>
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
                  setText(initialTitle); // 실패시 원래 이름으로 복구
                }
              }
            }}
          />
        </View>
      </View>
      <Pressable
        className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
        onPress={() => {
          handleClose();
          setTimeout(() => {
            if (props.type === 'FOLDER') {
              navigation.push('ScrapContent', { id: props.id });
            } else {
              openNote({ id: props.id, title: props.name });
              navigation.push('ScrapContentDetail', { id: props.id });
            }
          }, 100);
        }}>
        <BookOpenText size={20} />
        {props.type === 'FOLDER' ? (
          <Text className='text-16r text-black'>폴더 열기</Text>
        ) : (
          <Text className='text-16r text-black'>스크랩 열기</Text>
        )}
      </Pressable>
      {props.type === 'FOLDER' && (
        <Pressable
          className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
          onPress={onPressChangeCover}>
          <BookImage size={20} />
          <Text className='text-16r text-black'>표지 변경하기</Text>
        </Pressable>
      )}
      {props.type === 'SCRAP' && (
        <Pressable
          className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
          onPress={() => {
            handleClose();
            setTimeout(() => {
              onMovePress?.();
            }, 100);
          }}>
          <ArrowRightLeft size={20} />
          <Text className='text-16r text-black'>폴더 이동하기</Text>
        </Pressable>
      )}
      <Pressable
        className='flex-1 flex-row items-center gap-2 pl-4 pr-[26px]'
        onPress={async () => {
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
        }}>
        <Trash2 size={20} color={colors['red-400']} />
        <Text className='text-16r text-red-400'>휴지통으로 이동</Text>
      </Pressable>
    </View>
  );
};
