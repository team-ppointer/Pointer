import React from 'react';
import { Text, View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';

import { colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';

interface MenuListItemProps {
  icon?: LucideIcon;
  title: string;
  onPress?: () => void;
  isNew?: boolean;
  showChevron?: boolean;
  children?: React.ReactNode;
}

export const MenuListItem = ({
  icon: Icon,
  title,
  onPress,
  isNew,
  children,
  showChevron = true,
}: MenuListItemProps) => {
  return (
    <AnimatedPressable
      className='h-[48px] flex-row items-center bg-white px-[16px]'
      onPress={onPress}
      accessibilityLabel={title}
      disableScale>
      <View className='h-[48px] flex-1 flex-row items-center'>
        {Icon ? (
          <View className='mr-[4px] h-[30px] w-[30px] items-center justify-center'>
            <Icon size={20} color={colors['gray-700']} />
          </View>
        ) : null}
        <Text className={`text-16m flex-1 ${Icon ? 'text-black' : 'text-gray-700'}`}>{title}</Text>
        <View className='flex-row items-center gap-[4px]'>
          {isNew && (
            <View className='bg-new rounded-full px-[6px] py-[2px]'>
              <Text className='text-12r text-white'>New</Text>
            </View>
          )}
          {children}
          {showChevron && (
            <View className='items-center justify-center p-[8px]'>
              <ChevronRight size={20} color={colors['gray-600']} />
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
};
