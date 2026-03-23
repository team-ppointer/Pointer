import React from 'react';
import { Text, View, Image, Pressable } from 'react-native';
import { MessageSquareText, ImageIcon } from 'lucide-react-native';
import { colors } from '@theme/tokens';

import type { ChatRoomSearchResult, MessageSearchResult } from '../../types';

// Highlight text component
const HighlightedText = ({
  text,
  highlight,
  className,
}: {
  text: string;
  highlight: string;
  className?: string;
}) => {
  if (!highlight) {
    return <Text className={className}>{text}</Text>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <Text className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={index} className='text-blue-500'>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
};

// Chat Room Search Result Item
interface ChatRoomResultItemProps {
  result: ChatRoomSearchResult;
  onPress: () => void;
}

export const ChatRoomResultItem = ({ result, onPress }: ChatRoomResultItemProps) => {
  const { title, thumbnailUrl, status, date, matchedKeyword } = result;

  return (
    <Pressable
      onPress={onPress}
      className='mr-[12px] w-[140px] rounded-[12px] bg-white p-[12px] active:bg-gray-100'>
      {/* Thumbnail */}
      <View className='mb-[10px] h-[100px] items-center justify-center overflow-hidden rounded-[8px] bg-gray-200'>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} className='h-full w-full' resizeMode='cover' />
        ) : (
          <ImageIcon size={32} color={colors['gray-400']} />
        )}
      </View>

      {/* Title */}
      <HighlightedText
        text={title}
        highlight={matchedKeyword}
        className='text-14sb mb-[4px] text-gray-900'
      />

      {/* Meta */}
      <Text className='text-12r text-gray-600' numberOfLines={1}>
        {status === 'asking' ? '질문중' : '해결완료'} | {date}
      </Text>
    </Pressable>
  );
};

// Message Search Result Item
interface MessageResultItemProps {
  result: MessageSearchResult;
  onPress: () => void;
}

export const MessageResultItem = ({ result, onPress }: MessageResultItemProps) => {
  const { content, senderName, senderType, status, date, thumbnailUrl, matchedKeyword } = result;

  const isPublisher = senderType === 'publisher';

  return (
    <Pressable
      onPress={onPress}
      className='mr-[12px] w-[200px] rounded-[12px] bg-white p-[12px] active:bg-gray-100'>
      {/* Thumbnail */}
      <View className='mb-[10px] h-[80px] items-center justify-center overflow-hidden rounded-[8px] bg-gray-200'>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} className='h-full w-full' resizeMode='cover' />
        ) : (
          <MessageSquareText size={32} color={colors['gray-400']} />
        )}
      </View>

      {/* Content Preview */}
      <HighlightedText
        text={content}
        highlight={matchedKeyword}
        className='text-13r mb-[8px] text-gray-800'
      />

      {/* Sender Info */}
      <Text className='text-14sb mb-[2px] text-gray-900'>{senderName}</Text>

      {/* Meta */}
      <Text className='text-12r text-gray-600' numberOfLines={1}>
        {isPublisher ? '출제진' : senderName} | {status === 'asking' ? '질문중' : '해결완료'} |{' '}
        {date}
      </Text>
    </Pressable>
  );
};
