import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { colors } from '@/theme/tokens';

interface MenuListItemProps {
  icon: LucideIcon;
  title: string;
  onPress?: () => void;
  isLast?: boolean;
  isNew?: boolean;
}

export const MenuListItem = ({ icon: Icon, title, onPress, isLast, isNew }: MenuListItemProps) => {
  const showBorder = isLast === false;

  return (
    <Pressable className='flex-row items-center rounded-[12px] bg-white px-4' onPress={onPress}>
      <View
        className={`flex-1 flex-row items-center gap-1 py-3 ${showBorder ? 'border-b-[1px] border-[#DFE2E7]' : ''}`}>
        <View className='px-[3px]'>
          <Icon size={20} color={colors['gray-700']} />
        </View>
        <View className='flex-1'>
          <Text className='text-16m text-black'>{title}</Text>
        </View>
        <View className='flex-row items-center gap-1'>
          {isNew && (
            <View className='h-[22px] w-[37px] rounded-[30px] bg-[#E75043] px-[6px] py-0.5'>
              <Text className='text-12r text-white'>New</Text>
            </View>
          )}
          <View className='h-[36px] w-[36px] justify-center'>
            <ChevronRight size={20} color={colors['gray-600']} />
          </View>
        </View>
      </View>
    </Pressable>
  );
};
