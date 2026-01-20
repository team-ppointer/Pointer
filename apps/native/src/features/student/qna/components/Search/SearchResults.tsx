import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import type { ChatRoomSearchResult, MessageSearchResult } from '../../types';
import { ChatRoomResultItem, MessageResultItem } from './SearchResultItem';

interface SearchResultsProps {
  chatRooms: ChatRoomSearchResult[];
  messages: MessageSearchResult[];
  onSelectChatRoom: (result: ChatRoomSearchResult) => void;
  onSelectMessage: (result: MessageSearchResult) => void;
}

const SectionHeader = ({ title }: { title: string }) => (
  <View className='px-[24px] pb-[12px] pt-[20px]'>
    <Text className='text-16sb text-gray-900'>{title}</Text>
  </View>
);

const EmptyState = () => (
  <View className='flex-1 items-center justify-center py-[60px]'>
    <Text className='text-14r text-gray-600'>검색 결과가 없습니다.</Text>
  </View>
);

const SearchResults = ({
  chatRooms,
  messages,
  onSelectChatRoom,
  onSelectMessage,
}: SearchResultsProps) => {
  const hasResults = chatRooms.length > 0 || messages.length > 0;

  if (!hasResults) {
    return <EmptyState />;
  }

  return (
    <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
      {/* Chat Rooms Section */}
      {chatRooms.length > 0 && (
        <>
          <SectionHeader title='채팅방' />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}>
            {chatRooms.map((result, index) => (
              <ChatRoomResultItem
                key={`room-${result.id}-${index}`}
                result={result}
                onPress={() => onSelectChatRoom(result)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* Messages Section */}
      {messages.length > 0 && (
        <>
          <SectionHeader title='메시지' />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            {messages.map((result, index) => (
              <MessageResultItem
                key={`msg-${result.id}-${index}`}
                result={result}
                onPress={() => onSelectMessage(result)}
              />
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
};

export default SearchResults;
