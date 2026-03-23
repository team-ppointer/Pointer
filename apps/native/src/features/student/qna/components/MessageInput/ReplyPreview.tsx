import React from 'react';
import { Text, View, Image } from 'react-native';
import { X, ImageIcon } from 'lucide-react-native';

import { colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';

import type { Message } from '../../types';

interface ReplyPreviewProps {
  message: Message;
  senderName?: string;
  onClose: () => void;
}

const ReplyPreview = ({ message, senderName, onClose }: ReplyPreviewProps) => {
  const isImageReply = message.type === 'image' || message.type === 'reply-image';
  const imageUrl = message.image?.url;
  const isMe = message.sender === 'me';

  // Display text based on sender
  const replyToText = isMe
    ? '자신에게 답장 보내는 중'
    : `${senderName ?? '상대방'}에게 답장 보내는 중`;

  return (
    <View className='mx-[12px] flex-row items-center gap-[12px] border-b border-gray-300 py-[8px]'>
      {/* Image Thumbnail - shown for image replies */}
      {isImageReply && imageUrl && (
        <View className='h-[42px] w-[42px] overflow-hidden rounded-[8px] bg-gray-200'>
          <Image source={{ uri: imageUrl }} className='h-full w-full' resizeMode='cover' />
        </View>
      )}

      {/* Image Placeholder - shown when no image URL */}
      {isImageReply && !imageUrl && (
        <View className='h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-gray-200'>
          <ImageIcon size={24} color={colors['gray-500']} />
        </View>
      )}

      {/* Content */}
      <View className='flex-1 gap-[2px]'>
        <Text className='text-12r text-black'>{replyToText}</Text>
        {isImageReply ? (
          <Text className='text-12r text-gray-600'>사진</Text>
        ) : (
          <Text className='text-12r text-gray-600' numberOfLines={1}>
            {message.content}
          </Text>
        )}
      </View>

      {/* Close Button */}
      <AnimatedPressable
        onPress={onClose}
        className='h-[28px] w-[28px] items-center justify-center rounded-full'>
        <X size={18} color={colors['gray-600']} />
      </AnimatedPressable>
    </View>
  );
};

export default ReplyPreview;
