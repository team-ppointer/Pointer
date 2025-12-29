import { Pressable, View, Text, Image } from 'react-native';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { ScrapItem } from '@/features/student/scrap/utils/types';
import { it } from 'node:test';
import { useGetFolderDetail } from '@/apis';
import { useNoteStore } from '@/stores/scrapNoteStore';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';
import { useMemo } from 'react';

export interface SearchResultCardProps {
  item: ScrapItem;
}

export const SearchResultCard = ({ item }: SearchResultCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { data: foldersDetailData } = useGetFolderDetail(Number(item.folderId), !!item.folderId);
  const folderName = foldersDetailData?.name;

  const openNote = useNoteStore((state) => state.openNote);

  // thumbnailUrl이 변경될 때만 source 객체 재생성
  const imageSource = useMemo(
    () => (item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined),
    [item.thumbnailUrl]
  );

  const cardContent = (
    <View className='h-full w-full items-center rounded-[10px] p-[10px]'>
      <View className='w-full gap-3'>
        <ImageWithSkeleton
          source={imageSource}
          width='100%'
          aspectRatio={1}
          borderRadius={10}
          resizeMode='cover'
          uniqueId={item.id}
          fallback={<View className='aspect-square w-full rounded-[10px] bg-gray-600' />}
        />
        <View className='w-full justify-between px-1'>
          {folderName && <Text className='text-12m text-black'>{folderName}</Text>}
          <View className='flex-row  items-center  gap-0.5'>
            <Text className='text-16sb flex-1 text-[#1E1E21]' numberOfLines={2}>
              {item.name}
            </Text>
            {item.type === 'FOLDER' && <Text className='text-12m text-gray-700'>폴더</Text>}
          </View>

          <Text className='text-10r text-gray-700'>
            {new Date(item.createdAt).toLocaleString('ko-kr')}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Pressable
      onPress={() => {
        if (item.type === 'FOLDER') {
          navigation.push('ScrapContent', { id: item.id });
        } else if (item.type === 'SCRAP') {
          openNote({ id: item.id, title: item.name });
          navigation.push('ScrapContentDetail', { id: item.id });
        }
      }}>
      {cardContent}
    </Pressable>
  );
};
