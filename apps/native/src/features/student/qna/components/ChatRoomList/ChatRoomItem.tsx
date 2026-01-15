import React from 'react';
import { Text, View, Image } from 'react-native';
import { MessageSquare, MessageSquareText, MessagesSquare } from 'lucide-react-native';
import { colors } from '@theme/tokens';
import type { ChatRoom } from '../../types';
import { StatusBadge } from '../common';
import { PointerSymbol } from '@components/system/icons';
import { AnimatedPressable } from '@components/common';

interface ChatRoomItemProps {
  chatRoom: ChatRoom;
  isSelected?: boolean;
  onPress: () => void;
}

const PublisherIcon = () => (
  <View className='bg-primary-600 h-[34px] w-[34px] items-center justify-center rounded-full'>
    <PointerSymbol size={30} />
  </View>
);

const DefaultIcon = () => (
  <View className='h-[34px] w-[34px] items-center justify-center rounded-[6px] bg-blue-200'>
    <MessagesSquare size={18} color={colors['primary-500']} />
  </View>
);

const ThumbnailImage = ({ url }: { url: string }) => (
  <Image
    source={{ uri: url }}
    className='h-[34px] w-[34px] rounded-[6px] bg-gray-200'
    resizeMode='cover'
  />
);

const ChatRoomItem = ({ chatRoom, isSelected, onPress }: ChatRoomItemProps) => {
  const { type, title, lastMessage, lastMessageTime, status, hasNewMessage, thumbnailUrl } =
    chatRoom;

  const isPublisher = type === 'publisher';

  const renderThumbnail = () => {
    if (isPublisher) {
      return <PublisherIcon />;
    }
    if (thumbnailUrl) {
      return <ThumbnailImage url={thumbnailUrl} />;
    }
    return <DefaultIcon />;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      className={`flex-row items-center gap-[12px] px-[20px] py-[8px] ${
        isSelected ? 'bg-gray-200' : 'bg-white'
      }`}>
      {/* Thumbnail */}
      <View className='flex-shrink-0'>{renderThumbnail()}</View>

      {/* Content */}
      <View className='flex-1 gap-[4px]'>
        {/* Title Row */}
        <View className='flex-row items-center gap-[20px]'>
          <View className='flex-1 flex-row items-center gap-[4px]'>
            <Text className='text-13m text-black' numberOfLines={1}>
              {title}
            </Text>
            {!isPublisher && <StatusBadge status={status} />}
          </View>
          <Text className='text-10r text-gray-700'>{lastMessageTime}</Text>
        </View>

        {/* Message Preview */}
        <View className='flex-row items-center gap-[8px]'>
          <Text className='text-12r flex-1 leading-[130%] text-gray-700' numberOfLines={2}>
            {lastMessage}
          </Text>
          {hasNewMessage && (
            <View className='h-[8px] w-[8px] flex-shrink-0 rounded-full bg-red-500' />
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default ChatRoomItem;
