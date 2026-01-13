import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { colors } from '@/theme/tokens';

interface IconMenuItemProps {
  title: string;
  onPress?: () => void;
  className?: string;
  iconColor?: string;
  showChevron?: boolean;
}

export const IconMenuItem = ({
  title,
  onPress,
  className,
  showChevron = true,
}: IconMenuItemProps) => {
  return (
    <Pressable
      className={`flex-row items-center gap-1 rounded-[10px] border-[1px] border-[#DFE2E7] bg-white px-4`}
      onPress={onPress}>
      <View className={`flex-1 flex-row items-center gap-3 py-3`}>
        <View className='flex-1'>
          <Text className='text-16m text-gray-700'>{title}</Text>
        </View>
        {showChevron && (
          <View className='h-[36px] w-[36px] justify-center'>
            <ChevronRight size={20} color={colors['gray-600']} />
          </View>
        )}
      </View>
    </Pressable>
  );
};
