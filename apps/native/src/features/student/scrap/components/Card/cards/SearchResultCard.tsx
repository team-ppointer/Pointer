import { Pressable, View, Text } from 'react-native';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { ScrapItem } from '@/features/student/scrap/utils/types';

export interface SearchResultCardProps {
  item: ScrapItem;
}

/**
 * 검색 결과 카드 컴포넌트
 */
export const SearchResultCard = ({ item }: SearchResultCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  return (
    <Pressable
      className='w-full items-center gap-3 rounded-[10px] p-[10px]'
      onPress={() => {
        if (item.type === 'FOLDER') {
          navigation.push('ScrapContent', { id: String(item.id) });
        }
        // TODO: 스크랩 상세 화면으로 이동
      }}>
      <View className='h-[145.5px] w-[145.5px] rounded-[10px] bg-gray-600' />

      <View className='w-full px-[6px]'>
        <View className='flex-row items-center justify-between'>
          <Text className='text-16sb flex-1 text-[#1E1E21]' numberOfLines={2}>
            {item.name}
          </Text>

          {item.type === 'FOLDER' && <Text className='text-12m text-gray-800'>폴더</Text>}
        </View>

        <Text className='text-10r text-gray-700'>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
};

