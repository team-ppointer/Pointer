import React from 'react';
import { Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';

import type { ChatRoom, ChatRoomStatus } from '../../types';
import { Dropdown } from '../common';
import { STATUS_OPTIONS } from '../../constants';

interface ChatRoomHeaderProps {
  chatRoom: ChatRoom;
  onStatusChange?: (status: ChatRoomStatus) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ChatRoomHeader = ({
  chatRoom,
  onStatusChange,
  onBack,
  showBackButton = false,
}: ChatRoomHeaderProps) => {
  const insets = useSafeAreaInsets();
  const isPublisher = chatRoom.type === 'publisher';

  return (
    <View
      className='border-b border-gray-500 bg-gray-100'
      style={{ paddingTop: showBackButton ? insets.top : 0 }}>
      <View className='h-[56px] flex-row items-center justify-center px-[16px]'>
        <View className='flex-row items-center gap-[8px]'>
          {showBackButton && (
            <AnimatedPressable
              onPress={onBack}
              className='size-[40px] items-center justify-center rounded-full'>
              <ChevronLeft size={28} color={colors['gray-800']} />
            </AnimatedPressable>
          )}
          <View className='flex-1 flex-row items-center justify-center gap-[8px]'>
            <Text className='text-18b text-gray-900'>
              {isPublisher ? '출제진' : chatRoom.title}
            </Text>
            {!isPublisher && onStatusChange && (
              <Dropdown
                options={STATUS_OPTIONS}
                value={chatRoom.status}
                onChange={onStatusChange}
                variant='status'
              />
            )}
          </View>
          {showBackButton && <View className='size-[40px]' />}
        </View>
      </View>
    </View>
  );
};

export default ChatRoomHeader;
