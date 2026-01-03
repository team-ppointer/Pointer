import React from 'react';
import { Text, View } from 'react-native';
import type { ChatRoomStatus } from '../../types';

interface StatusBadgeProps {
  status: ChatRoomStatus;
  size?: 'sm' | 'md';
}

const StatusBadge = ({ status, size = 'sm' }: StatusBadgeProps) => {
  const isAsking = status === 'asking';

  const sizeStyles = {
    sm: 'h-[20px] px-[4px]',
    md: 'px-[8px] py-[3px]',
  };

  const textSizeStyles = {
    sm: 'text-12m',
    md: 'text-12m',
  };

  return (
    <View
      className={`rounded-[4px] ${sizeStyles[size]} ${
        isAsking ? 'bg-blue-200' : 'bg-green-100'
      }`}>
      <Text
        className={`${textSizeStyles[size]} ${
          isAsking ? 'text-blue-500' : 'text-green-500'
        }`}>
        {isAsking ? '질문중' : '해결완료'}
      </Text>
    </View>
  );
};

export default StatusBadge;

