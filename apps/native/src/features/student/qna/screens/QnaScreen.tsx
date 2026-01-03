import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StudentRootStackParamList } from '@navigation/student/types';
import type { ChatRoom as ChatRoomType } from '../types';
import { DUMMY_CHAT_ROOMS } from '../constants';
import { ChatRoomList } from '../components/ChatRoomList';
import { ChatRoom } from '../components/ChatRoom';
import { useIsTablet } from '../hooks/useIsTablet';

type QnaScreenNavigationProp = NativeStackNavigationProp<StudentRootStackParamList>;

const QnaScreen = () => {
  const navigation = useNavigation<QnaScreenNavigationProp>();
  const isTablet = useIsTablet();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(
    isTablet ? DUMMY_CHAT_ROOMS[0] : null
  );

  const handleSelectRoom = (room: ChatRoomType) => {
    if (isTablet) {
      setSelectedRoom(room);
    } else {
      navigation.navigate('ChatRoom', { chatRoomId: room.id });
    }
  };

  const handleNewQuestion = () => {
    // TODO: Navigate to new question screen or show modal
    console.log('New question');
  };

  const handleSearch = () => {
    navigation.navigate('QnaSearch');
  };

  // Tablet: Split view
  if (isTablet) {
    return (
      <SafeAreaView className='flex-1 flex-row bg-gray-100' edges={['top']}>
        {/* Left Panel - Chat Room List */}
        <View className='w-[40%] min-w-[320px] max-w-[400px] border-r border-gray-500 bg-white'>
          <ChatRoomList
            chatRooms={DUMMY_CHAT_ROOMS}
            selectedRoomId={selectedRoom?.id}
            onSelectRoom={handleSelectRoom}
            onNewQuestion={handleNewQuestion}
            onSearch={handleSearch}
          />
        </View>

        {/* Right Panel - Chat Room */}
        <View className='flex-1'>
          <ChatRoom chatRoom={selectedRoom} />
        </View>
      </SafeAreaView>
    );
  }

  // Mobile: List only
  return (
    <SafeAreaView className='flex-1 bg-gray-100' edges={['top']}>
      <ChatRoomList
        chatRooms={DUMMY_CHAT_ROOMS}
        onSelectRoom={handleSelectRoom}
        onNewQuestion={handleNewQuestion}
        onSearch={handleSearch}
      />
    </SafeAreaView>
  );
};

export default QnaScreen;
