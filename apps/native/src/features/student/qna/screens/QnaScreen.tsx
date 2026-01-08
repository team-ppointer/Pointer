import React, { useState, useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StudentRootStackParamList } from '@navigation/student/types';
import {
  useGetQnaList,
  useGetQnaAdminChat,
  useGetQnaById,
} from '@apis/controller/student/qna';
import type { ChatRoom as ChatRoomType } from '../types';
import { mapQnAMetaToChatRoom, mapAdminChatToChatRoom } from '../types';
import { ChatRoomList } from '../components/ChatRoomList';
import { ChatRoom } from '../components/ChatRoom';
import { useIsTablet } from '../hooks/useIsTablet';

type QnaScreenNavigationProp = NativeStackNavigationProp<StudentRootStackParamList>;

const QnaScreen = () => {
  const navigation = useNavigation<QnaScreenNavigationProp>();
  const isTablet = useIsTablet();

  // Selected room state
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);

  // Fetch QnA list (teacher chats)
  const {
    data: qnaListData,
    isLoading: isLoadingQnaList,
    error: qnaListError,
  } = useGetQnaList();

  // Fetch admin chat (publisher)
  const {
    data: adminChatData,
    isLoading: isLoadingAdminChat,
    error: adminChatError,
  } = useGetQnaAdminChat();

  // Determine if selected room is admin chat
  const isSelectedRoomAdmin = selectedRoom?.type === 'publisher';

  // Fetch selected QnA details (for teacher chats)
  const { data: selectedQnaData } = useGetQnaById({
    qnaId: selectedRoom?.id ?? 0,
    enabled: isTablet && !!selectedRoom && !isSelectedRoomAdmin && selectedRoom.id > 0,
  });

  // Map API responses to ChatRoom format
  const chatRooms = useMemo<ChatRoomType[]>(() => {
    const rooms: ChatRoomType[] = [];

    // Add admin chat (publisher) at the top if exists
    if (adminChatData) {
      rooms.push(mapAdminChatToChatRoom(adminChatData));
    }

    // Add teacher chats
    if (qnaListData?.data?.groups) {
      qnaListData.data.groups.forEach((group) => {
        group.data?.forEach((qna) => {
          rooms.push(mapQnAMetaToChatRoom(qna));
        });
      });
    }

    return rooms;
  }, [qnaListData, adminChatData]);

  // Auto-select first room on tablet when data loads
  React.useEffect(() => {
    if (isTablet && chatRooms.length > 0 && !selectedRoom) {
      setSelectedRoom(chatRooms[0]);
    }
  }, [isTablet, chatRooms, selectedRoom]);

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

  const isLoading = isLoadingQnaList || isLoadingAdminChat;
  const hasError = qnaListError || adminChatError;

  // 컨텐츠 렌더링 함수 - early return 대신 동일한 구조 유지
  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (hasError) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-14r text-gray-600">데이터를 불러올 수 없습니다.</Text>
        </View>
      );
    }

    if (isTablet) {
      return (
        <View className="flex-1 flex-row">
          {/* Left Panel - Chat Room List */}
          <View className="w-[40%] min-w-[320px] max-w-[400px] border-r border-gray-500 bg-white">
            <ChatRoomList
              chatRooms={chatRooms}
              selectedRoomId={selectedRoom?.id}
              onSelectRoom={handleSelectRoom}
              onNewQuestion={handleNewQuestion}
              onSearch={handleSearch}
            />
          </View>

          {/* Right Panel - Chat Room */}
          <View className="flex-1">
            <ChatRoom
              chatRoom={selectedRoom}
              qnaData={isSelectedRoomAdmin ? undefined : selectedQnaData}
              adminChatData={isSelectedRoomAdmin ? adminChatData : undefined}
            />
          </View>
        </View>
      );
    }

    return (
      <ChatRoomList
        chatRooms={chatRooms}
        onSelectRoom={handleSelectRoom}
        onNewQuestion={handleNewQuestion}
        onSearch={handleSearch}
      />
    );
  };

  // 항상 동일한 SafeAreaView 구조 유지
  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      {renderContent()}
    </SafeAreaView>
  );
};

export default QnaScreen;
