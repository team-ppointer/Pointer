import { Pressable, View, Text, Image } from 'react-native';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { ScrapItem } from '@/features/student/scrap/utils/types';
import { it } from 'node:test';
import { useGetFolderDetail } from '@/apis';
import { useNoteStore } from '@/stores/scrapNoteStore';

export interface SearchResultCardProps {
  item: ScrapItem;
}

export const SearchResultCard = ({ item }: SearchResultCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { data: foldersDetailData } = useGetFolderDetail(Number(item.folderId), !!item.folderId);
  const folderName = foldersDetailData?.name;

  const openNote = useNoteStore((state) => state.openNote);

  const thumbnailUrl = item.type === 'SCRAP' ? item.thumbnailUrl : undefined;

  const cardContent = (
    <View className='w-full items-center gap-3 rounded-[10px] p-[10px]'>
      <View className='h-[145px] w-full'>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            resizeMode='cover'
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <View className='h-full w-full rounded-[10px] bg-gray-600' />
        )}
      </View>

      <View className='w-full px-[6px]'>
        {folderName && <Text className='text-12m text-black'>{folderName}</Text>}
        <View className='flex-row items-start justify-between gap-0.5'>
          <Text className='text-16sb flex-1 text-[#1E1E21]' numberOfLines={2}>
            {item.name}
          </Text>

          {item.type === 'FOLDER' && <Text className='text-12m text-gray-700'>폴더</Text>}
        </View>

        <Text className='text-10r text-gray-700'>
          {new Date(item.createdAt).toLocaleDateString('ko-kr')}
        </Text>
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
