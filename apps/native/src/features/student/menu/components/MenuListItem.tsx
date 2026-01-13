import React from 'react';
import { Text, View } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { colors } from '@/theme/tokens';
import { AnimatedPressable } from '@/components/common';

interface MenuListItemProps {
  icon?: LucideIcon;
  title: string;
  onPress?: () => void;
  isNew?: boolean;
  showChevron?: boolean;
  children?: React.ReactNode;
}

export const MenuListItem = ({ icon: Icon, title, onPress, isNew, children, showChevron = true }: MenuListItemProps) => {
  return (
    <AnimatedPressable
      className='h-[48px] flex-row items-center bg-white px-[16px]'
      onPress={onPress}
      disableScale>
      <View className='h-[48px] flex-1 flex-row items-center'>
        {Icon && (
          <View className='mr-[4px] h-[30px] w-[30px] items-center justify-center'>
            <Icon size={20} color={colors['gray-700']} />
          </View>
        )}
        <Text className={`flex-1 text-16m ${Icon ? 'text-black' : 'text-gray-700'}`}>{title}</Text>
        <View className='flex-row items-center gap-[4px]'>
          {isNew && (
            <View className='rounded-full bg-new px-[6px] py-[2px]'>
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
