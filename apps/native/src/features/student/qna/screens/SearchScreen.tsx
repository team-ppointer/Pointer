import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentRootStackParamList } from '@navigation/student/types';
import type { ChatRoomSearchResult, MessageSearchResult } from '../types';
import {
  DUMMY_RECENT_SEARCHES,
  DUMMY_SEARCH_CHAT_ROOMS,
  DUMMY_SEARCH_MESSAGES,
} from '../constants';
import { SearchHeader, RecentSearches, SearchResults } from '../components/Search';

type SearchScreenNavigationProp = NativeStackNavigationProp<StudentRootStackParamList>;

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(DUMMY_RECENT_SEARCHES);
  const [hasSearched, setHasSearched] = useState(false);

  // In a real app, these would come from an API
  const searchResults = {
    chatRooms: hasSearched ? DUMMY_SEARCH_CHAT_ROOMS : [],
    messages: hasSearched ? DUMMY_SEARCH_MESSAGES : [],
  };

  const handleSearch = useCallback(() => {
    if (!searchText.trim()) return;

    // Add to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== searchText.trim());
      return [searchText.trim(), ...filtered].slice(0, 10);
    });

    setHasSearched(true);
    // TODO: Perform actual search API call
    console.log('Search:', searchText);
  }, [searchText]);

  const handleSelectRecentSearch = useCallback((search: string) => {
    setSearchText(search);
    setHasSearched(true);
    // TODO: Perform actual search API call
    console.log('Search from recent:', search);
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
      navigation.navigate('ChatRoom', { chatRoomId: result.id });
    },
    [navigation]
  );

  const handleSelectMessage = useCallback(
    (result: MessageSearchResult) => {
      navigation.navigate('ChatRoom', { chatRoomId: result.chatRoomId });
    },
    [navigation]
  );

  const handleSearchTextChange = useCallback((text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setHasSearched(false);
    }
  }, []);

  return (
    <View className="flex-1 bg-gray-100">
      <SearchHeader
        value={searchText}
        onChange={handleSearchTextChange}
        onSubmit={handleSearch}
        onCancel={handleCancel}
      />

      {hasSearched ? (
        <SearchResults
          chatRooms={searchResults.chatRooms}
          messages={searchResults.messages}
          onSelectChatRoom={handleSelectChatRoom}
          onSelectMessage={handleSelectMessage}
        />
      ) : (
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

