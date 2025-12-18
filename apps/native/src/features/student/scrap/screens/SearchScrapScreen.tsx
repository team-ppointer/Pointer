import Container from '@/components/common/Container';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { colors } from '@/theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SearchScrapGrid } from '../components/Card/ScrapCardGrid';
import { useSearchHistoryStore } from '@/stores/scrapDataStore';
import SearchScrapHeader from '../components/Header/SearchHeader';
import { useSearchScraps } from '@/apis';

const SearchScrapScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const [query, setQuery] = useState('');
  const [shouldSearch, setShouldSearch] = useState(false);
  const { keywords, addKeyword, removeKeyword, clear } = useSearchHistoryStore();

  // API 검색
  const { data: searchData } = useSearchScraps(
    {
      query: query.trim(),
      filter: 'ALL',
      sort: 'CREATED_AT',
      order: 'DESC',
    },
    // 쿼리가 있을 때만 검색
    query.trim().length > 0
  );

  const results = searchData?.data || [];

  const onSearch = () => {
    if (!query.trim()) return;
    addKeyword(query);
    setShouldSearch(true);
  };

  return (
    <View className='w-full bg-gray-100'>
      <SearchScrapHeader
        navigateback={navigation}
        query={query}
        setQuery={setQuery}
        onSubmitEditing={onSearch}
      />
      <Container className='flex-col justify-between py-[10px]'>
        {query.length === 0 ? (
          <View className='w-full flex-row items-center justify-between'>
            <Text className='text-16m rounded-1 gap-0.5 p-1 text-gray-900'>최근 검색어</Text>
            <Pressable className='gap-[10px] px-2' onPress={() => clear()}>
              <Text className='text-12sb text-blue-500'>전체 지우기</Text>
            </Pressable>
          </View>
        ) : (
          <Text className='text-16m rounded-1 gap-0.5 p-1 text-gray-900'>검색 결과</Text>
        )}
        {query.length === 0 && (
          <ScrollView
            className='py-[10px]'
            horizontal={true}
            contentContainerClassName='gap-[10px]'>
            {keywords.map((item, i) => (
              <View
                key={i}
                className='w-fit flex-row items-center gap-2.5 rounded-[50px] bg-gray-300 px-[14px] py-2'>
                <Pressable onPress={() => setQuery(item)}>
                  <Text className='text-16m text-[#1E1E21]'>{item}</Text>
                </Pressable>
                <Pressable onPress={() => removeKeyword(item)}>
                  <X size={20} color='#9FA4AE' />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
      </Container>
      <Container className='flex-row items-end justify-between py-[10px]'>
        <SearchScrapGrid data={results} />
      </Container>
    </View>
  );
};

export default SearchScrapScreen;
