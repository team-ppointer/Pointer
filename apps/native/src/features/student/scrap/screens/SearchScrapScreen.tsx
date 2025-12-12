import Container from '@/components/common/Container';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { colors } from '@/theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DummyItem, SearchScrapGrid } from '../components/ScrapItemGrid';
import { useScrapStore } from '@/stores/scrapDataStore';
import { SearchResultItem } from '../components/ScrapItem';

const SearchScrapScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const [query, setQuery] = useState('');
  const searchByTitle = useScrapStore((state) => state.searchByTitle);
  const [results, setResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
    } else {
      setResults(searchByTitle(query));
    }
  }, [query]);

  return (
    <View className='w-full flex-1 bg-gray-100'>
      <SafeAreaView edges={['top']} className='bg-gray-100'>
        <View className='flex-row items-center justify-between px-5 py-3.5'>
          <View className='flex-1 flex-row justify-center rounded-[8px] border-[1px] border-gray-500 bg-white px-3.5 py-2'>
            <TextInput
              className='text-18m flex-1 text-black'
              placeholder='스크랩 제목을 검색하세요.'
              multiline={false}
              textAlignVertical='top'
              placeholderTextColor={colors['gray-500']}
              allowFontScaling={false}
              numberOfLines={1}
              value={query}
              onChangeText={setQuery}
              onEndEditing={() => {}}
            />
            {query.length > 0 && (
              <Pressable
                className='items-center justify-center gap-[10px] rounded-[100px] bg-gray-400 p-0.5'
                onPress={() => setQuery('')}>
                <X size={20} color={'#3E3F45'} />
              </Pressable>
            )}
          </View>
          {navigation.canGoBack() ? (
            <Pressable onPress={() => navigation.goBack()} className='p-2'>
              <View className='items-center justify-center gap-[10px]'>
                <ChevronLeft className='text-black' size={32} />
              </View>
            </Pressable>
          ) : (
            <View className='h-[48px] w-[48px] gap-[10px]' />
          )}
        </View>
      </SafeAreaView>
      <Container className='flex-row items-end justify-between py-[10px]'>
        {query.length === 0 ? (
          <>
            <Text className='text-16m rounded-1 gap-0.5 p-1 text-gray-900'>최근 검색어</Text>
            <Pressable className='gap-[10px] px-2'>
              <Text className='text-12sb text-blue-500'>전체 지우기</Text>
            </Pressable>
          </>
        ) : (
          <Text className='text-16m rounded-1 gap-0.5 p-1 text-gray-900'>검색 결과</Text>
        )}
      </Container>
      <Container className='flex-row items-end justify-between py-[10px]'>
        <SearchScrapGrid data={results} />
      </Container>
    </View>
  );
};

export default SearchScrapScreen;
