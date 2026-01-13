import { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common';

type Props = {
  title: string;
  children: ReactNode;
  onPressBack?: () => void;
  rightElement?: ReactNode;
};

export const ScreenLayout = ({
  title,
  children,
  onPressBack,
  rightElement,
}: Props) => {
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
      <SafeAreaView
        edges={['top']}>
          <View className='h-[52px] flex-row items-center justify-between px-[20px]'>
            <AnimatedPressable onPress={handleBack} className='w-[48px] h-[48px] items-center justify-center'>
              <ChevronLeft size={32} color='#000' />
            </AnimatedPressable>
            <Text className='text-20b text-gray-900'>{title}</Text>
            {rightElement ?? <View className='w-[48px] h-[48px]' />}
          </View>
      </SafeAreaView>
      {children}
    </View>
  );
};
