import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { AnimatedPressable } from '@components/common';

interface NotificationHeaderProps extends NativeStackHeaderProps {
  title: string;
}

const NotificationHeader = ({ back, title, navigation }: NotificationHeaderProps) => {
  return (
    <SafeAreaView edges={['top']}>
      <View className='flex-row items-center justify-between px-[20px] py-[14px]'>
        {back ? (
          <AnimatedPressable onPress={() => navigation.goBack()} className='w-[48px] h-[48px] items-center justify-center'>
            <ChevronLeft className='text-black' size={32} />
          </AnimatedPressable>
        ) : (
          <View className='w-[48px] h-[48px]' />
        )}
        <Text className='text-20b text-gray-900'>
          {title}
        </Text>
        <View className='h-[48px] w-[48px] gap-[10px]' />
      </View>
    </SafeAreaView>
  );
};

export default NotificationHeader;

