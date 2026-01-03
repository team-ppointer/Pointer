import React, { useState, useMemo } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChatRoom as ChatRoomType, Message, ChatRoomStatus } from '../../types';
import { DUMMY_PUBLISHER_MESSAGES, DUMMY_TEACHER_MESSAGES } from '../../constants';
import { MessageList } from '../Message';
import { MessageInput, type SelectedImage, type SelectedFile } from '../MessageInput';
import ChatRoomHeader from './ChatRoomHeader';

interface ChatRoomProps {
  chatRoom: ChatRoomType | null;
  onBack?: () => void;
  showBackButton?: boolean;
}

const EmptyState = () => (
  <View className='flex-1 items-center justify-center bg-gray-100'>
    <Text className='text-14r text-gray-600'>채팅방을 선택해주세요.</Text>
  </View>
);

const NewChatState = ({ teacherName }: { teacherName?: string }) => (
  <View className='flex-1 items-center justify-center bg-gray-100'>
    <Text className='text-14r text-gray-600'>{teacherName ?? 'OOO'} 선생님에게</Text>
    <Text className='text-14r text-gray-600'>질문을 시작해보세요!</Text>
  </View>
);

const ChatRoom = ({ chatRoom, onBack, showBackButton = false }: ChatRoomProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [status, setStatus] = useState<ChatRoomStatus>(chatRoom?.status ?? 'asking');
  const insets = useSafeAreaInsets();

  const isPublisher = chatRoom?.type === 'publisher';
  const messages = isPublisher ? DUMMY_PUBLISHER_MESSAGES : DUMMY_TEACHER_MESSAGES;

  // Filter messages: show only 'other' messages for "코멘트 모아보기" tab
  const filteredMessages = useMemo(() => {
    if (isPublisher && selectedTab === 1) {
      // "코멘트 모아보기" - show only publisher's messages (other)
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

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const handleClearReply = () => {
    setReplyTo(null);
  };

  const handleSend = (text: string, reply?: Message) => {
    // TODO: Implement actual send logic
    console.log('Send message:', text, reply);
    setReplyTo(null);
  };

  const handleStatusChange = (newStatus: ChatRoomStatus) => {
    setStatus(newStatus);
    // TODO: Implement actual status change logic
    console.log('Status changed:', newStatus);
  };

  const handleImageSelected = (image: SelectedImage) => {
    // TODO: Implement actual image upload and send logic
    console.log('Image selected:', image);
    Alert.alert(
      '이미지 선택됨',
      `파일: ${image.fileName ?? 'image'}\n크기: ${image.width}x${image.height}`
    );
  };

  const handleFileSelected = (file: SelectedFile) => {
    // TODO: Implement actual file upload and send logic
    console.log('File selected:', file);
    Alert.alert(
      '파일 선택됨',
      `파일: ${file.name}\n크기: ${file.size ? `${Math.round(file.size / 1024)}KB` : '알 수 없음'}`
    );
  };

  const showCommentsOnly = isPublisher && selectedTab === 1;

  // Calculate keyboard offset: tab bar height + bottom safe area
  const keyboardOffset = Platform.OS === 'ios' ? 10 + insets.bottom : 0;

  return (
    <KeyboardAvoidingView
      className='flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardOffset}>
      <View className='flex-1 bg-gray-200'>
        <ChatRoomHeader
          chatRoom={{ ...chatRoom, status }}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          onStatusChange={!isPublisher ? handleStatusChange : undefined}
          onBack={onBack}
          showBackButton={showBackButton}
        />

        {filteredMessages.length === 0 ? (
          <NewChatState teacherName={chatRoom.teacherName} />
        ) : (
          <>
            <MessageList
              messages={filteredMessages}
              senderName={senderName}
              profileImageUrl={profileImageUrl}
              onReply={showCommentsOnly ? undefined : handleReply}
              onPressImage={(url) => console.log('Open image:', url)}
              onPressFile={(url) => console.log('Open file:', url)}
            />
            {/* Hide input in "코멘트 모아보기" tab */}
            {!showCommentsOnly && (
              <MessageInput
                replyTo={replyTo}
                senderName={senderName}
                onClearReply={handleClearReply}
                onSend={handleSend}
                onImageSelected={handleImageSelected}
                onFileSelected={handleFileSelected}
                disabled={status === 'resolved'}
              />
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;
