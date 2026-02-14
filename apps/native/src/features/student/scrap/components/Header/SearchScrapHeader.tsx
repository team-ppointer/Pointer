import { CircleXFilledIcon } from '@/components/system/icons';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { colors } from '@/theme/tokens';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, CircleX, X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
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
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 자동으로 포커스
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // 약간의 지연을 주어 화면 렌더링이 완료된 후 포커스

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView edges={['top']} className='bg-gray-100'>
      <View className='flex-row items-center justify-between px-5 py-[14px]'>
        <View className='h-[40px] flex-1 flex-row justify-center rounded-[8px] border-[1px] border-gray-500 bg-white px-3.5 py-2'>
          <TextInput
            ref={inputRef}
            className='text-16r flex-1 text-black'
            placeholder='검색어를 입력해 주세요.'
            style={{ lineHeight: 20, paddingVertical: 0 }}
            multiline={false}
            placeholderClassName='text-16r text-gray-600'
            numberOfLines={1}
            value={query}
            returnKeyType='search'
            onSubmitEditing={onSubmitEditing}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable
              className='items-center justify-center gap-[10px] p-0.5'
              onPress={() => setQuery('')}>
              <CircleXFilledIcon size={24} color={colors['gray-700']} />
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
