import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/theme/tokens';

interface TextOnlyMenuItemProps {
  title: string;
  onPress?: () => void;
  isLast?: boolean;
}

export const TextOnlyMenuItem = ({ title, onPress, isLast }: TextOnlyMenuItemProps) => {
  const showBorder = isLast === false;

  return (
    <Pressable className='flex-row items-center gap-1 bg-white px-4' onPress={onPress}>
      <View
        className={`flex-1 flex-row items-center py-3 ${showBorder ? 'border-b-[1px] border-[#DFE2E7]' : ''}`}>
        <View className='flex-1'>
          <Text className='text-16m text-gray-700'>{title}</Text>
        </View>
        <View className='h-[36px] w-[36px] justify-center'>
          <ChevronRight size={20} color={colors['gray-600']} />
        </View>
      </View>
    </Pressable>
  );
};
