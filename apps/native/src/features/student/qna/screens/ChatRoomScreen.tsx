import React, { useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { StudentRootStackParamList } from '@navigation/student/types';
import { useGetQnaById, useGetQnaAdminChat } from '@apis/controller/student/qna';
import type { ChatRoom as ChatRoomType } from '../types';
import { mapQnAMetaToChatRoom, mapAdminChatToChatRoom } from '../types';
import { ChatRoom } from '../components/ChatRoom';

type ChatRoomScreenProps = NativeStackScreenProps<StudentRootStackParamList, 'ChatRoom'>;
type ChatRoomScreenNavigationProp = NativeStackNavigationProp<StudentRootStackParamList>;

const ChatRoomScreen = () => {
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();
  const route = useRoute<ChatRoomScreenProps['route']>();
  const { chatRoomId } = route.params;

  // Determine if this is the admin chat (publisher)
  // Admin chat has a special ID or type indicator
  const isAdminChat = chatRoomId === -1; // Convention: -1 for admin chat

  // Fetch QnA by ID for teacher chats
  const {
    data: qnaData,
    isLoading: isLoadingQna,
    error: qnaError,
  } = useGetQnaById({
    qnaId: chatRoomId,
    enabled: !isAdminChat && chatRoomId > 0,
  });

  // Fetch admin chat for publisher
  const {
    data: adminChatData,
    isLoading: isLoadingAdminChat,
    error: adminChatError,
  } = useGetQnaAdminChat({
    enabled: isAdminChat,
  });

  // Map to ChatRoom format
  const chatRoom = useMemo<ChatRoomType | null>(() => {
    if (isAdminChat && adminChatData) {
      return mapAdminChatToChatRoom(adminChatData);
    }
    if (!isAdminChat && qnaData) {
      return {
        id: qnaData.id,
        type: qnaData.type === 'ADMIN_CHAT' ? 'publisher' : 'teacher',
        title: qnaData.title,
        lastMessage: qnaData.latestMessageContent ?? '',
        lastMessageTime: '',
        status: 'asking',
        hasNewMessage: (qnaData.unreadCount ?? 0) > 0,
        teacherName: qnaData.studentName,
        publishId: qnaData.publishId,
        publishDate: qnaData.publishDate,
      };
    }
    return null;
  }, [isAdminChat, qnaData, adminChatData]);

  const handleBack = () => {
    navigation.goBack();
  };

  const isLoading = isLoadingQna || isLoadingAdminChat;
  const hasError = qnaError || adminChatError;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-14r text-gray-600">데이터를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <ChatRoom
        chatRoom={chatRoom}
        qnaData={isAdminChat ? undefined : qnaData}
        adminChatData={isAdminChat ? adminChatData : undefined}
        onBack={handleBack}
        showBackButton
      />
    </View>
  );
};

export default ChatRoomScreen;
