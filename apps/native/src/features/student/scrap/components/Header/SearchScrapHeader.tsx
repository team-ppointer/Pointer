import { StudentRootStackParamList } from '@/navigation/student/types';
import { colors } from '@/theme/tokens';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, CircleX, X } from 'lucide-react-native';
import { Pressable, TextInput, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SearchScrapHeaderProps {
  navigateback: NativeStackNavigationProp<StudentRootStackParamList>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  onSubmitEditing: () => void;
}

const SearchScrapHeader = ({
  navigateback,
  query,
  setQuery,
  onSubmitEditing,
}: SearchScrapHeaderProps) => {
  return (
    <SafeAreaView edges={['top']} className='bg-gray-100'>
      <View className='flex-row items-center justify-between px-5 py-3.5'>
        <View className='flex-1 flex-row justify-center rounded-[8px] border-[1px] border-gray-500 bg-white px-3.5 py-2'>
          <TextInput
            className='text-18m flex-1 text-black'
            placeholder='스크랩 제목을 검색하세요.'
            multiline={false}
            textAlignVertical='center'
            placeholderTextColor={colors['gray-500']}
            allowFontScaling={false}
            numberOfLines={1}
            value={query}
            returnKeyType='search'
            onSubmitEditing={onSubmitEditing}
            onChangeText={setQuery}
            onEndEditing={() => {}}
          />
          {query.length > 0 && (
            <Pressable
              className='items-center justify-center gap-[10px] p-0.5'
              onPress={() => setQuery('')}>
              <CircleX size={24} color={colors['gray-700']} />
            </Pressable>
          )}
        </View>
        {navigateback.canGoBack() ? (
          <Pressable onPress={() => navigateback.goBack()} className='pl-3 pr-2'>
            <Text className='text-14sb text-gray-800'>취소</Text>
          </Pressable>
        ) : (
          <View className='h-[48px] w-[48px] gap-[10px]' />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchScrapHeader;
