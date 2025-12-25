import { colors } from '@/theme/tokens';
import { FileSymlink, FolderOpen, ImagePlay, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View, Text, Pressable } from 'react-native';
import { showToast } from '../Modal/Toast';
import { ScrapListItemProps } from '../Card/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentRootStackParamList } from '@/navigation/student/types';
import {
  useUpdateScrapName,
  useUpdateFolder,
  useDeleteScrap,
  useGetScrapDetail,
  useGetFolders,
} from '@/apis';
import { useNoteStore } from '@/stores/scrapNoteStore';
import { useGetPreSignedUrl } from '@/apis/controller/common/postGetPreSignedUrl';

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
  const { mutateAsync: deleteScrap } = useDeleteScrap();

  // 스크랩 상세 정보 가져오기 (필요한 경우)
  const { data: scrapDetail } = useGetScrapDetail(Number(props.id), props.type === 'SCRAP');
  const { data: foldersData } = useGetFolders();

  const { mutate: getPreSignedUrl } = useGetPreSignedUrl();

  // S3에 파일 업로드
  const uploadFileToS3 = async (
    uploadUrl: string,
    fileUri: string,
    contentDisposition: string
  ): Promise<boolean> => {
    try {
      // React Native에서 파일 읽기
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // S3에 PUT 요청
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'content-disposition': contentDisposition,
        },
        body: blob,
      });

      return uploadResponse.ok;
    } catch (error) {
      console.error('S3 업로드 실패:', error);
      return false;
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
                    await updateFolder({
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
        <FolderOpen size={20} />
        {props.type === 'FOLDER' ? (
          <Text className='text-16r text-black'>폴더 열기</Text>
        ) : (
          <Text className='text-16r text-black'>스크랩 열기</Text>
        )}
      </Pressable>
      {props.type === 'FOLDER' && (
        <Pressable className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'>
          <ImagePlay size={20} />
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
          <FileSymlink size={20} />
          <Text className='text-16r text-black'>폴더 이동하기</Text>
        </Pressable>
      )}
      <Pressable
        className='flex-1 flex-row items-center gap-2 pl-4 pr-[26px]'
        onPress={async () => {
          try {
            await deleteScrap({
              items: [
                {
                  id: props.id,
                  type: props.type as 'FOLDER' | 'SCRAP',
                },
              ],
            });

            handleClose();
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
