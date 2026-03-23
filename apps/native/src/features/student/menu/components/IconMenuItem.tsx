import React from 'react';
import { Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';

interface IconMenuItemProps {
  title: string;
  onPress?: () => void;
  className?: string;
  showChevron?: boolean;
}

export const IconMenuItem = ({
  title,
  onPress,
  className,
  showChevron = true,
}: IconMenuItemProps) => {
  return (
    <AnimatedPressable
      className='flex-row items-center gap-1 rounded-[10px] border border-gray-300 bg-white px-[16px] py-[11px]'
      onPress={onPress}
      accessibilityLabel={title}
      disableScale>
      <View className='flex-1'>
        <Text className='text-16r text-black'>{title}</Text>
      </View>
      {showChevron && (
        <View className='h-[24px] w-[24px] items-center justify-center'>
          <ChevronRight size={20} color={colors['gray-600']} />
        </View>
      )}
    </AnimatedPressable>
  );
};
