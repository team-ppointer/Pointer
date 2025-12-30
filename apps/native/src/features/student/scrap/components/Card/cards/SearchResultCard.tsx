import { Pressable, View, Text, Image } from 'react-native';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useGetFolderDetail } from '@/apis';
import { useNoteStore } from '@/stores/scrapNoteStore';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';
import { useMemo } from 'react';
import type { ScrapListItemProps } from '../types';

export const SearchResultCard = (props: ScrapListItemProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  const openNote = useNoteStore((state) => state.openNote);

  const folderTop2Thumbnail = props.type === 'FOLDER' ? props.top2ScrapThumbnail : undefined;

  const { imageSources, isDiagonalLayout } = useMemo(() => {
    // folderTop2Thumbnail이 있으면 그것을 우선 사용 (최대 2개, 대각선 배치)
    if (folderTop2Thumbnail && folderTop2Thumbnail.length > 0) {
      return {
        imageSources: folderTop2Thumbnail.slice(0, 2).map((url) => ({ uri: url })),
        isDiagonalLayout: true,
      };
    }

    if (props.thumbnailUrl) {
      return {
        imageSources: [{ uri: props.thumbnailUrl }],
        isDiagonalLayout: false,
      };
    }

    return {
      imageSources: undefined,
      isDiagonalLayout: false,
    };
  }, [props.thumbnailUrl, folderTop2Thumbnail]);

  const cardContent = (
    <View className='h-full w-full items-center rounded-[10px] p-[10px]'>
      <View className='w-full gap-3'>
        <View className='items-center'>
          <ImageWithSkeleton
            key={`${props.type}-${props.id}`}
            source={imageSources}
            width='100%'
            aspectRatio={1}
            borderRadius={10}
            resizeMode='cover'
            uniqueId={`${props.type}-${props.id}`}
            isDiagonalLayout={isDiagonalLayout}
            fallback={<View className='aspect-square w-full rounded-[10px] bg-gray-600' />}
          />
        </View>
        <View className='w-full justify-between px-1'>
          <View className='flex-row  gap-0.5'>
            <Text className='text-16sb flex-1 text-[#1E1E21]' numberOfLines={2}>
              {props.name}
            </Text>
            {props.type === 'FOLDER' && (
              <Text className='text-12m text-blue-500'>{props.scrapCount}</Text>
            )}
          </View>

          <Text className='text-10r text-gray-700' numberOfLines={1}>
            {props.updatedAt
              ? new Date(props.updatedAt).toLocaleString('ko-kr')
              : new Date(props.createdAt).toLocaleString('ko-kr')}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Pressable
      onPress={() => {
        if (props.type === 'FOLDER') {
          navigation.push('ScrapContent', { id: props.id });
        } else if (props.type === 'SCRAP') {
          openNote({ id: props.id, title: props.name });
          navigation.push('ScrapContentDetail', { id: props.id });
        }
      }}>
      {cardContent}
    </Pressable>
  );
};
