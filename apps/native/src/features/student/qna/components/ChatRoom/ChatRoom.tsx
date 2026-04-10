import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  usePostQnaChat,
  usePutQna,
  usePutQnaChat,
  useDeleteQnaChat,
  useInvalidateQnaData,
} from '@apis/controller/student/qna';
import { useUploadFile } from '@apis/controller/common/file';
import useSubscribeQna from '@apis/controller/common/qna/useGetSubscribeQna';
import { getAccessToken } from '@utils/auth';
import type { components } from '@schema';

import type { ChatRoom as ChatRoomType, Message, ChatRoomStatus, QnAResp } from '../../types';
import { mapQnARespToMessages } from '../../types';
import { MessageList } from '../Message';
import { MessageInput, type SelectedImage, type SelectedFile } from '../MessageInput';

import ChatRoomHeader from './ChatRoomHeader';

interface ChatRoomProps {
  chatRoom: ChatRoomType | null;
  qnaData?: QnAResp;
  onBack?: () => void;
  showBackButton?: boolean;
}

const EmptyState = () => (
  <View className='flex-1 items-center justify-center bg-gray-100'>
    <Text className='text-14r text-gray-600'>채팅방을 선택해주세요.</Text>
  </View>
);

const NewChatState = ({
  teacherName,
  isPublisher,
}: {
  teacherName?: string;
  isPublisher?: boolean;
}) => (
  <View className='flex-1 items-center justify-center bg-gray-200'>
    {isPublisher ? (
      <>
        <Text className='text-14r text-gray-600'>포인터 출제진에게</Text>
        <Text className='text-14r text-gray-600'>질문을 시작해보세요!</Text>
      </>
    ) : (
      <>
        <Text className='text-14r text-gray-600'>{teacherName ?? 'OOO'} 선생님에게</Text>
        <Text className='text-14r text-gray-600'>질문을 시작해보세요!</Text>
      </>
    )}
  </View>
);

const ChatRoom = ({ chatRoom, qnaData, onBack, showBackButton = false }: ChatRoomProps) => {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [status, setStatus] = useState<ChatRoomStatus>(chatRoom?.status ?? 'asking');
  const insets = useSafeAreaInsets();

  const { invalidateQnaById } = useInvalidateQnaData();

  const isPublisher = chatRoom?.type === 'publisher';
  const qnaId = chatRoom?.id;
  const token = getAccessToken();

  // 최초 연결 시 onOpen 스킵 가드 (재연결 시에만 catch-up)
  const hasSseOpenedRef = useRef(false);

  // 방 변경 시 가드 리셋 — 새 방에 대해 최초 연결은 다시 스킵해야 함
  useEffect(() => {
    hasSseOpenedRef.current = false;
  }, [qnaId]);

  // Refetch data when selected room changes
  useEffect(() => {
    if (qnaId) {
      console.log('[ChatRoom] Room changed, refetching data for qnaId:', qnaId);
      void invalidateQnaById(Number(qnaId));
    }
  }, [qnaId, invalidateQnaById]);

  // Subscribe to SSE for real-time updates (chat events only)
  // read_status is now handled by ChatRoomScreen's useSubscribeQnaList
  useSubscribeQna({
    qnaId: qnaId ? Number(qnaId) : 0,
    token: token ?? '',
    enabled: !!qnaId && !!token,
    onChatEvent: useCallback(
      (event: components['schemas']['QnAChatEvent']) => {
        console.log('[ChatRoom] Chat event received:', event);
        if (event.qnaId) {
          void invalidateQnaById(event.qnaId);
        }
      },
      [invalidateQnaById]
    ),
    onOpen: useCallback(() => {
      // 최초 연결 시 스킵 — React Query의 initial fetch + room change effect로 충분
      if (!hasSseOpenedRef.current) {
        hasSseOpenedRef.current = true;
        return;
      }
      // 재연결 시 놓친 메시지 catch-up
      if (qnaId) {
        void invalidateQnaById(Number(qnaId));
      }
    }, [qnaId, invalidateQnaById]),
    onError: useCallback((error: Error) => {
      console.error('[ChatRoom] SSE error:', error);
    }, []),
  });

  // Post chat mutation
  const postChatMutation = usePostQnaChat({
    qnaId: qnaId,
    onSuccess: () => {
      if (qnaId) {
        void invalidateQnaById(Number(qnaId));
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

  // File upload mutation
  const uploadFileMutation = useUploadFile({
    onError: (error) => {
      // 10MB 초과 에러는 이미 useUploadFile에서 alert를 띄웠으므로 무시
      if (error instanceof Error && error.message === 'File size exceeds 10MB') {
        return;
      }
      console.error('Failed to upload file:', error);
      Alert.alert('오류', '파일 업로드에 실패했습니다.');
    },
  });

  // Update chat mutation (for editing messages)
  const updateChatMutation = usePutQnaChat({
    qnaId: qnaId,
    onSuccess: () => {
      setEditingMessage(null);
      if (qnaId) {
        void invalidateQnaById(Number(qnaId));
      }
    },
    onError: (error) => {
      console.error('Failed to update message:', error);
      Alert.alert('오류', '메시지 수정에 실패했습니다.');
    },
  });

  // Delete chat mutation
  const deleteChatMutation = useDeleteQnaChat({
    qnaId: qnaId,
    onSuccess: () => {
      if (qnaId) {
        void invalidateQnaById(Number(qnaId));
      }
    },
    onError: (error) => {
      console.error('Failed to delete message:', error);
      Alert.alert('오류', '메시지 삭제에 실패했습니다.');
    },
  });

  // Map API data to messages
  const messages = useMemo<Message[]>(() => {
    if (qnaData) {
      return mapQnARespToMessages(qnaData);
    }
    return [];
  }, [qnaData]);

  const filteredMessages = messages;

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleClearReply = useCallback(() => {
    setReplyTo(null);
  }, []);

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
      if (!qnaId) return;

      const fileName = image.fileName ?? `image_${Date.now()}.jpg`;
      const mimeType = image.type ?? 'image/jpeg';

      uploadFileMutation.mutate([{ uri: image.uri, name: fileName, type: mimeType }], {
        onSuccess: (uploadedFiles) => {
          if (uploadedFiles.length > 0) {
            const fileIds = uploadedFiles.map((f) => f.id);
            const content = uploadedFiles.length > 1 ? `사진 ${uploadedFiles.length}장` : '사진';

            postChatMutation.mutate({
              qnaId,
              content,
              files: fileIds,
              replyToId: replyTo?.id,
            });
            setReplyTo(null);
          }
        },
      });
    },
    [qnaId, uploadFileMutation, postChatMutation, replyTo]
  );

  const handleFileSelected = useCallback(
    (file: SelectedFile) => {
      if (!qnaId) return;

      const mimeType = file.mimeType ?? 'application/octet-stream';

      uploadFileMutation.mutate([{ uri: file.uri, name: file.name, type: mimeType }], {
        onSuccess: (uploadedFiles) => {
          if (uploadedFiles.length > 0) {
            const fileIds = uploadedFiles.map((f) => f.id);
            postChatMutation.mutate({
              qnaId,
              content: file.name,
              files: fileIds,
              replyToId: replyTo?.id,
            });
            setReplyTo(null);
          }
        },
      });
    },
    [qnaId, uploadFileMutation, postChatMutation, replyTo]
  );

  // Handle edit message
  const handleEditMessage = useCallback((message: Message) => {
    // Only allow editing text messages
    if (message.type === 'text' || message.type === 'reply-text') {
      setEditingMessage(message);
      setReplyTo(null);
    } else {
      Alert.alert('알림', '텍스트 메시지만 수정할 수 있습니다.');
    }
  }, []);

  // Handle delete message
  const handleDeleteMessage = useCallback(
    (message: Message) => {
      deleteChatMutation.mutate(message.id);
    },
    [deleteChatMutation]
  );

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
  }, []);

  // Modified send handler to support editing
  const handleSendOrUpdate = useCallback(
    (text: string, reply?: Message) => {
      if (!qnaId) return;

      if (editingMessage) {
        // Update existing message
        updateChatMutation.mutate({
          chatId: editingMessage.id,
          data: { content: text },
        });
      } else {
        // Send new message
        postChatMutation.mutate({
          qnaId,
          content: text,
          replyToId: reply?.id,
        });
        setReplyTo(null);
      }
    },
    [qnaId, editingMessage, updateChatMutation, postChatMutation]
  );

  if (!chatRoom) {
    return <EmptyState />;
  }

  // Sender name: "포인터 출제진" for publisher, teacherName for others
  const senderName = isPublisher ? '포인터 출제진' : chatRoom.teacherName;
  // Profile image: undefined for publisher (will show default icon), thumbnailUrl for teachers
  const profileImageUrl = isPublisher ? undefined : chatRoom.thumbnailUrl;

  const isSending =
    postChatMutation.isPending ||
    uploadFileMutation.isPending ||
    updateChatMutation.isPending ||
    deleteChatMutation.isPending;

  // Calculate keyboard offset:
  // - 태블릿(탭바 있음): 탭바 높이 + 하단 safe area
  // - 모바일(전체 화면): 하단 safe area는 MessageInput에서 처리하므로 최소값만 적용
  const keyboardOffset = Platform.OS === 'ios' ? (showBackButton ? 0 : 10 + insets.bottom) : 0;

  return (
    <KeyboardAvoidingView
      className='flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardOffset}>
      <View className='flex-1 bg-gray-200'>
        <ChatRoomHeader
          chatRoom={{ ...chatRoom, status }}
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
            onReply={false ? undefined : handleReply}
            onPressFile={(url) => console.log('Open file:', url)}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
          />
        )}

        {/* Hide input in "코멘트 모아보기" tab */}
        {!false && (
          <MessageInput
            replyTo={replyTo}
            editingMessage={editingMessage}
            senderName={senderName}
            onClearReply={handleClearReply}
            onCancelEdit={handleCancelEdit}
            onSend={handleSendOrUpdate}
            onImageSelected={handleImageSelected}
            onFileSelected={handleFileSelected}
            disabled={status === 'resolved' || isSending}
            useSafeAreaBottom={showBackButton}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;
