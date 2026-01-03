import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostQnaChat, usePutQna, useInvalidateQnaData } from '@apis/controller/student/qna';
import useSubscribeQna from '@apis/controller/common/qna/useGetSubscribeQna';
import { getAccessToken } from '@utils/auth';
import type {
  ChatRoom as ChatRoomType,
  Message,
  ChatRoomStatus,
  QnAResp,
} from '../../types';
import { mapQnARespToMessages } from '../../types';
import { MessageList } from '../Message';
import { MessageInput, type SelectedImage, type SelectedFile } from '../MessageInput';
import ChatRoomHeader from './ChatRoomHeader';

interface ChatRoomProps {
  chatRoom: ChatRoomType | null;
  qnaData?: QnAResp;
  adminChatData?: QnAResp;
  onBack?: () => void;
  showBackButton?: boolean;
}

const EmptyState = () => (
  <View className="flex-1 items-center justify-center bg-gray-100">
    <Text className="text-14r text-gray-600">채팅방을 선택해주세요.</Text>
  </View>
);

const NewChatState = ({
  teacherName,
  isPublisher,
}: {
  teacherName?: string;
  isPublisher?: boolean;
}) => (
  <View className="flex-1 items-center justify-center bg-gray-200">
    {isPublisher ? (
      <>
        <Text className="text-14r text-gray-600">포인터 출제진에게</Text>
        <Text className="text-14r text-gray-600">질문을 시작해보세요!</Text>
      </>
    ) : (
      <>
        <Text className="text-14r text-gray-600">{teacherName ?? 'OOO'} 선생님에게</Text>
        <Text className="text-14r text-gray-600">질문을 시작해보세요!</Text>
      </>
    )}
  </View>
);

const ChatRoom = ({
  chatRoom,
  qnaData,
  adminChatData,
  onBack,
  showBackButton = false,
}: ChatRoomProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [status, setStatus] = useState<ChatRoomStatus>(chatRoom?.status ?? 'asking');
  const insets = useSafeAreaInsets();

  const { invalidateQnaById, invalidateQnaAdminChat, invalidateQnaList } = useInvalidateQnaData();

  const isPublisher = chatRoom?.type === 'publisher';
  const qnaId = chatRoom?.id;
  const token = getAccessToken();

  // Subscribe to SSE for real-time updates
  useSubscribeQna({
    qnaId: qnaId ? Number(qnaId) : 0,
    token: token ?? '',
    enabled: !!qnaId && !!token,
    onChatEvent: useCallback(
      (event) => {
        console.log('[ChatRoom] Chat event received:', event);
        // Invalidate queries to refresh data
        if (event.qnaId) {
          if (isPublisher) {
            void invalidateQnaAdminChat();
          } else {
            void invalidateQnaById(event.qnaId);
          }
          // Also refresh the list
          void invalidateQnaList();
        }
      },
      [isPublisher, invalidateQnaById, invalidateQnaAdminChat, invalidateQnaList]
    ),
    onReadStatusEvent: useCallback(
      (event) => {
        console.log('[ChatRoom] Read status event received:', event);
        // Optionally handle read status updates
        if (event.qnaId) {
          if (isPublisher) {
            void invalidateQnaAdminChat();
          } else {
            void invalidateQnaById(event.qnaId);
          }
        }
      },
      [isPublisher, invalidateQnaById, invalidateQnaAdminChat]
    ),
    onError: useCallback((error) => {
      console.error('[ChatRoom] SSE error:', error);
    }, []),
  });

  // Post chat mutation
  const postChatMutation = usePostQnaChat({
    qnaId: qnaId,
    onSuccess: () => {
      if (qnaId) {
        if (isPublisher) {
          void invalidateQnaAdminChat();
        } else {
          void invalidateQnaById(Number(qnaId));
        }
      }
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    },
  });

  // Update QnA mutation (for status change)
  const updateQnaMutation = usePutQna({
    onSuccess: () => {
      if (qnaId) {
        void invalidateQnaById(Number(qnaId));
      }
    },
    onError: (error) => {
      console.error('Failed to update status:', error);
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    },
  });

  // Map API data to messages
  const messages = useMemo<Message[]>(() => {
    if (isPublisher && adminChatData) {
      return mapQnARespToMessages(adminChatData);
    }
    if (!isPublisher && qnaData) {
      return mapQnARespToMessages(qnaData);
    }
    return [];
  }, [isPublisher, qnaData, adminChatData]);

  // Filter messages: show only 'other' messages for "코멘트 모아보기" tab
  const filteredMessages = useMemo(() => {
    if (isPublisher && selectedTab === 1) {
      return messages.filter((msg) => msg.sender === 'other');
    }
    return messages;
  }, [messages, isPublisher, selectedTab]);

  if (!chatRoom) {
    return <EmptyState />;
  }

  // Sender name: "포인터 출제진" for publisher, teacherName for others
  const senderName = isPublisher ? '포인터 출제진' : chatRoom.teacherName;
  // Profile image: undefined for publisher (will show default icon), thumbnailUrl for teachers
  const profileImageUrl = isPublisher ? undefined : chatRoom.thumbnailUrl;

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleClearReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleSend = useCallback(
    (text: string, reply?: Message) => {
      if (!qnaId) return;

      postChatMutation.mutate({
        qnaId,
        content: text,
        replyToId: reply?.id,
      });

      setReplyTo(null);
    },
    [qnaId, postChatMutation]
  );

  const handleStatusChange = useCallback(
    (newStatus: ChatRoomStatus) => {
      if (!qnaId || isPublisher) return;

      setStatus(newStatus);

      // Note: The API might not have a direct status field
      // This would need to be adjusted based on actual API
      updateQnaMutation.mutate({
        qnaId,
        data: {
          question: qnaData?.question ?? '',
          // Status change might be handled differently
        },
      });
    },
    [qnaId, isPublisher, qnaData, updateQnaMutation]
  );

  const handleImageSelected = useCallback(
    (image: SelectedImage) => {
      // TODO: Implement image upload first, then send with image ID
      console.log('Image selected:', image);
      Alert.alert(
        '이미지 선택됨',
        `파일: ${image.fileName ?? 'image'}\n크기: ${image.width}x${image.height}\n\n이미지 업로드 기능은 추후 구현 예정입니다.`
      );
    },
    []
  );

  const handleFileSelected = useCallback(
    (file: SelectedFile) => {
      // TODO: Implement file upload first, then send with file ID
      console.log('File selected:', file);
      Alert.alert(
        '파일 선택됨',
        `파일: ${file.name}\n크기: ${file.size ? `${Math.round(file.size / 1024)}KB` : '알 수 없음'}\n\n파일 업로드 기능은 추후 구현 예정입니다.`
      );
    },
    []
  );

  const showCommentsOnly = isPublisher && selectedTab === 1;
  const isSending = postChatMutation.isPending;

  // Calculate keyboard offset: tab bar height + bottom safe area
  const keyboardOffset = Platform.OS === 'ios' ? 10 + insets.bottom : 0;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardOffset}>
      <View className="flex-1 bg-gray-200">
        <ChatRoomHeader
          chatRoom={{ ...chatRoom, status }}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          onStatusChange={!isPublisher ? handleStatusChange : undefined}
          onBack={onBack}
          showBackButton={showBackButton}
        />

        {filteredMessages.length === 0 ? (
          <NewChatState teacherName={chatRoom.teacherName} isPublisher={isPublisher} />
        ) : (
          <MessageList
            messages={filteredMessages}
            senderName={senderName}
            profileImageUrl={profileImageUrl}
            onReply={showCommentsOnly ? undefined : handleReply}
            onPressImage={(url) => console.log('Open image:', url)}
            onPressFile={(url) => console.log('Open file:', url)}
          />
        )}

        {/* Hide input in "코멘트 모아보기" tab */}
        {!showCommentsOnly && (
          <MessageInput
            replyTo={replyTo}
            senderName={senderName}
            onClearReply={handleClearReply}
            onSend={handleSend}
            onImageSelected={handleImageSelected}
            onFileSelected={handleFileSelected}
            disabled={status === 'resolved' || isSending}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;
