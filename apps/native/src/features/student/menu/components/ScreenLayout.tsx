import { type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import { AnimatedPressable } from '@components/common';

type Props = {
  title: string;
  children: ReactNode;
  onPressBack?: () => void;
  rightElement?: ReactNode;
};

export const ScreenLayout = ({ title, children, onPressBack, rightElement }: Props) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onPressBack) {
      onPressBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View className='w-full flex-1'>
      <View className='flex-row items-center justify-between px-[20px] py-[4px]'>
        <AnimatedPressable
          onPress={handleBack}
          className='items-center justify-center p-[8px]'
          accessibilityRole='button'
          accessibilityLabel='뒤로가기'>
          <ChevronLeft size={32} color='#000' />
        </AnimatedPressable>
        <Text className='text-20b text-gray-900'>{title}</Text>
        {rightElement ?? <View className='h-[48px] w-[48px]' />}
      </View>
      {children}
    </View>
  );
};
