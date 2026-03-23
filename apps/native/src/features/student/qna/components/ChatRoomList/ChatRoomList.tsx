import React, { useState, useMemo } from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors } from '@theme/tokens';

import type { ChatRoom, ChatRoomFilterType } from '../../types';

import ChatRoomItem from './ChatRoomItem';
import ChatRoomFilter from './ChatRoomFilter';

interface ChatRoomListProps {
  chatRooms: ChatRoom[];
  selectedRoomId?: number;
  onSelectRoom: (room: ChatRoom) => void;
  onNewQuestion: () => void;
  onSearch: () => void;
}

const ChatRoomList = ({
  chatRooms,
  selectedRoomId,
  onSelectRoom,
  onNewQuestion,
  onSearch,
}: ChatRoomListProps) => {
  const [filter, setFilter] = useState<ChatRoomFilterType>('all');

  const filteredRooms = useMemo(() => {
    if (filter === 'all') {
      return chatRooms;
    }
    // Publisher is always shown regardless of filter
    return chatRooms.filter((room) => room.type === 'publisher' || room.status === filter);
  }, [chatRooms, filter]);

  return (
    <View className='flex-1 bg-gray-100'>
      {/* Header */}
      <View className='h-[50px] flex-row items-center px-[20px]'>
        <Text className='text-18b text-gray-900'>QnA</Text>
        {/* <Pressable
          onPress={onSearch}
          className="h-[38px] w-[38px] items-center justify-center rounded-full active:bg-gray-200">
          <Search size={20} color={colors['gray-800']} />
        </Pressable> */}
      </View>

      {/* New Question Button */}
      {/* <View className="px-[20px] pb-[10px]">
        <Pressable
          onPress={onNewQuestion}
          className="items-center rounded-[8px] bg-primary-500 py-[10px] active:bg-primary-600">
          <Text className="text-14sb text-white">새로운 질문</Text>
        </Pressable>
      </View> */}

      {/* Filter Section */}
      <View className='h-[50px] flex-row items-center justify-between px-[20px]'>
        <Text className='text-16sb text-gray-900'>채팅방</Text>
        <ChatRoomFilter value={filter} onChange={setFilter} />
      </View>

      {/* Chat Room List */}
      <ScrollView className='flex-1'>
        {filteredRooms.map((room) => (
          <ChatRoomItem
            key={`${room.type}-${room.id}`}
            chatRoom={room}
            isSelected={room.id === selectedRoomId}
            onPress={() => onSelectRoom(room)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default ChatRoomList;
