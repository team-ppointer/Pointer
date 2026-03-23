import React, { useState, useCallback, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { StudentRootStackParamList } from '@navigation/student/types';
import { useGetQnaSearch } from '@apis/controller/student/qna';

import type { ChatRoomSearchResult, MessageSearchResult } from '../types';
import { mapSearchResults } from '../types';
import { SearchHeader, RecentSearches, SearchResults } from '../components/Search';

type SearchScreenNavigationProp = NativeStackNavigationProp<StudentRootStackParamList>;

// Local storage key for recent searches
const RECENT_SEARCHES_KEY = 'qna_recent_searches';

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Fetch search results
  const {
    data: searchData,
    isLoading,
    isFetching,
  } = useGetQnaSearch({
    query: submittedQuery,
    enabled: submittedQuery.trim().length > 0,
  });

  // Map search results to UI format
  const searchResults = useMemo(() => {
    if (!searchData) {
      return { chatRooms: [], messages: [] };
    }
    return mapSearchResults(searchData);
  }, [searchData]);

  const hasSearched = submittedQuery.trim().length > 0;

  const handleSearch = useCallback(() => {
    if (!searchText.trim()) return;

    const trimmedText = searchText.trim();

    // Add to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmedText);
      return [trimmedText, ...filtered].slice(0, 10);
    });

    setSubmittedQuery(trimmedText);
  }, [searchText]);

  const handleSelectRecentSearch = useCallback((search: string) => {
    setSearchText(search);
    setSubmittedQuery(search);
  }, []);

  const handleRemoveRecentSearch = useCallback((search: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== search));
  }, []);

  const handleClearAllRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectChatRoom = useCallback(
    (result: ChatRoomSearchResult) => {
      // Admin chat(publisher)의 경우 -1을 전달해야 ChatRoomScreen에서 올바르게 인식함
      const chatRoomId = result.type === 'publisher' ? -1 : result.id;
      navigation.navigate('ChatRoom', { chatRoomId });
    },
    [navigation]
  );

  const handleSelectMessage = useCallback(
    (result: MessageSearchResult) => {
      // Admin chat(publisher)의 경우 -1을 전달해야 ChatRoomScreen에서 올바르게 인식함
      const chatRoomId = result.senderType === 'publisher' ? -1 : result.chatRoomId;
      navigation.navigate('ChatRoom', { chatRoomId });
    },
    [navigation]
  );

  const handleSearchTextChange = useCallback((text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setSubmittedQuery('');
    }
  }, []);

  return (
    <View className='flex-1 bg-gray-100'>
      <SearchHeader
        value={searchText}
        onChange={handleSearchTextChange}
        onSubmit={handleSearch}
        onCancel={handleCancel}
      />

      {(isLoading || isFetching) && (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' />
        </View>
      )}
      {!(isLoading || isFetching) && hasSearched && (
        <SearchResults
          chatRooms={searchResults.chatRooms}
          messages={searchResults.messages}
          onSelectChatRoom={handleSelectChatRoom}
          onSelectMessage={handleSelectMessage}
        />
      )}
      {!(isLoading || isFetching) && !hasSearched && (
        <RecentSearches
          searches={recentSearches}
          onSelect={handleSelectRecentSearch}
          onRemove={handleRemoveRecentSearch}
          onClearAll={handleClearAllRecentSearches}
        />
      )}
    </View>
  );
};

export default SearchScreen;
