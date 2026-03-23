import React, { useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import type { StudentRootStackParamList } from '@navigation/student/types';
import { useGetQnaById } from '@apis/controller/student/qna';

import type { ChatRoom as ChatRoomType } from '../types';
import { ChatRoom } from '../components/ChatRoom';

type ChatRoomScreenProps = NativeStackScreenProps<StudentRootStackParamList, 'ChatRoom'>;
type ChatRoomScreenNavigationProp = NativeStackNavigationProp<StudentRootStackParamList>;

const ChatRoomScreen = () => {
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();
  const route = useRoute<ChatRoomScreenProps['route']>();
  const { chatRoomId } = route.params;

  // Fetch QnA by ID (works for both regular and admin chats)
  const {
    data: qnaData,
    isLoading,
    error,
  } = useGetQnaById({
    qnaId: chatRoomId,
    enabled: chatRoomId > 0,
  });

  // Map to ChatRoom format
  const chatRoom = useMemo<ChatRoomType | null>(() => {
    if (!qnaData) return null;

    const isAdminChat = qnaData.type === 'ADMIN_CHAT';

    return {
      id: qnaData.id,
      type: isAdminChat ? 'publisher' : 'teacher',
      title: isAdminChat ? '포인터 출제진' : qnaData.title,
      lastMessage: qnaData.latestMessageContent ?? '',
      lastMessageTime: '',
      status: 'asking',
      hasNewMessage: (qnaData.unreadCount ?? 0) > 0,
      teacherName: qnaData.studentName,
      publishId: qnaData.publishId,
      publishDate: qnaData.publishDate,
    };
  }, [qnaData]);

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-100'>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-100'>
        <Text className='text-14r text-gray-600'>데이터를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-100'>
      <ChatRoom chatRoom={chatRoom} qnaData={qnaData} onBack={handleBack} showBackButton />
    </View>
  );
};

export default ChatRoomScreen;
