import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { History } from 'lucide-react-native';
import { colors } from '@/theme/tokens';

interface AppVersionItemProps {
  version: string;
  isLatest?: boolean;
  onPress?: () => void;
  isLast?: boolean;
}

export const AppVersionItem = ({
  version,
  isLatest = true,
  onPress,
  isLast,
}: AppVersionItemProps) => {
  const showBorder = isLast === false;

  return (
    <Pressable className='flex-row items-center gap-1 bg-white px-4' onPress={onPress}>
      <View
        className={`flex-1 flex-row items-center py-3 ${showBorder ? 'border-b-[1px] border-[#DFE2E7]' : ''}`}>
        <View className='px-[3px]'>
          <History size={20} color={colors['gray-700']} />
        </View>
        <View className='flex-1'>
          <Text className='text-16m text-black'>앱 버젼</Text>
        </View>
        <View className='justify-center'>
          <Text className='text-16m text-blue-500'>
            {version} {isLatest ? '최신 버전' : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
