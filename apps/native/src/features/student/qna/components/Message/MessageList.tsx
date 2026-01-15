import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  Keyboard,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import ImageViewing from 'react-native-image-viewing';
import type { Message } from '../../types';
import MessageBubble from './MessageBubble';
import DateDivider from './DateDivider';

interface MessageListProps {
  messages: Message[];
  senderName?: string;
  profileImageUrl?: string;
  onReply?: (message: Message) => void;
  onPressFile?: (url: string) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

interface GroupedMessage {
  id: string;
  type: 'date' | 'message';
  date?: string;
  message?: Message;
  showProfile?: boolean;
  showTail?: boolean;
}

const MessageList = ({
  messages,
  senderName,
  profileImageUrl,
  onReply,
  onPressFile,
  onEdit,
  onDelete,
}: MessageListProps) => {
  const flatListRef = useRef<FlatList<GroupedMessage>>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Image viewer state
  const [viewerImages, setViewerImages] = useState<Array<{ uri: string }>>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  // Global translateX for time display (shared across all bubbles)
  const globalTranslateX = useSharedValue(0);

  // Handle image press to open full-screen viewer
  const handlePressImages = useCallback((images: Array<{ uri: string }>, initialIndex: number) => {
    setViewerImages(images);
    setViewerIndex(initialIndex);
    setIsViewerVisible(true);
  }, []);

  // Track if user is at the bottom of the scroll (top in inverted list)
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    // In inverted list, "bottom" is when contentOffset.y is close to 0
    const isBottom = contentOffset.y <= 50;
    setIsAtBottom(isBottom);
  }, []);

  // When keyboard shows, scroll to bottom if already at bottom
  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const subscription = Keyboard.addListener(keyboardShowEvent, () => {
      if (isAtBottom) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      }
    });

    return () => subscription.remove();
  }, [isAtBottom]);

  // Group messages and determine which messages should show profile/tail
  // Reversed for inverted FlatList
  const groupedMessages = useMemo<GroupedMessage[]>(() => {
    const groups: GroupedMessage[] = [];
    let currentDate = '';

    messages.forEach((message, index) => {
      // Add date divider when date changes
      if (message.date !== currentDate) {
        currentDate = message.date;
        groups.push({ id: `date-${currentDate}`, type: 'date', date: currentDate });
      }

      const previousMessage = index > 0 ? messages[index - 1] : null;
      const dateChanged = previousMessage && previousMessage.date !== message.date;
      const senderChanged = previousMessage && previousMessage.sender !== message.sender;

      // Show tail for first message in consecutive messages from the same sender
      // Also show tail when date changes
      const showTail = index === 0 || senderChanged || dateChanged || !previousMessage;

      // Show profile only for 'other' sender and when showTail is true
      const isOther = message.sender === 'other';
      const showProfile = isOther && showTail;

      groups.push({
        id: `msg-${message.id}`,
        type: 'message',
        message,
        showProfile,
        showTail,
      });
    });

    // Reverse for inverted FlatList (newest at bottom)
    return groups.reverse();
  }, [messages]);

  const renderItem = useCallback(
    ({ item }: { item: GroupedMessage }) => {
      if (item.type === 'date' && item.date) {
        return <DateDivider date={item.date} />;
      }

      if (item.type === 'message' && item.message) {
        return (
          <MessageBubble
            message={item.message}
            globalTranslateX={globalTranslateX}
            senderName={senderName}
            profileImageUrl={profileImageUrl}
            showProfile={item.showProfile}
            showTail={item.showTail}
            onReply={onReply}
            onPressImages={handlePressImages}
            onPressFile={onPressFile}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      }

      return null;
    },
    [
      globalTranslateX,
      senderName,
      profileImageUrl,
      onReply,
      handlePressImages,
      onPressFile,
      onEdit,
      onDelete,
    ]
  );

  const keyExtractor = useCallback((item: GroupedMessage) => item.id, []);

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={groupedMessages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted
        className='flex-1 bg-gray-200'
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // Performance optimizations
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
      />

      {/* Full-screen Image Viewer */}
      <ImageViewing
        images={viewerImages}
        imageIndex={viewerIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
    </>
  );
};

export default MessageList;
