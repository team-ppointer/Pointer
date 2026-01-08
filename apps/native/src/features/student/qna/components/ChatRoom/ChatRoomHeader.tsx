import React from 'react';
import { Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import type { ChatRoom, ChatRoomStatus } from '../../types';
import { Dropdown } from '../common';
import { STATUS_OPTIONS } from '../../constants';
import { AnimatedPressable } from '@components/common';

interface ChatRoomHeaderProps {
  chatRoom: ChatRoom;
  selectedTab?: number;
  onTabChange?: (index: number) => void;
  onStatusChange?: (status: ChatRoomStatus) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ChatRoomHeader = ({
  chatRoom,
  selectedTab = 0,
  onTabChange,
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
      {/* Title Row */}
      <View className='h-[50px] flex-row items-center justify-center px-[16px]'>
        <View className='flex-row items-center gap-[8px]'>
          {showBackButton && (
            <AnimatedPressable
              onPress={onBack}
              className='h-[40px] w-[40px] items-center justify-center rounded-full'>
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
            {showBackButton && (<View className='h-[40px] w-[40px]' />)}
        </View>
      </View>

      {/* Tab Row for Publisher - iOS Native Segmented Control */}
      {isPublisher && onTabChange && (
        <View className='px-[16px] pb-[10px]'>
          <SegmentedControl
            values={['QnA', '코멘트 모아보기']}
            selectedIndex={selectedTab}
            onChange={(event) => onTabChange(event.nativeEvent.selectedSegmentIndex)}
            appearance='light'
            style={{ height: 40 }}
            fontStyle={{ fontSize: 14, fontWeight: '500' }}
            activeFontStyle={{ fontSize: 14, fontWeight: '600' }}
          />
        </View>
      )}
    </View>
  );
};

export default ChatRoomHeader;
