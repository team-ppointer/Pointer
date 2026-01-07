import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

interface NotificationHeaderProps extends NativeStackHeaderProps {
  title: string;
}

const NotificationHeader = ({ back, title, navigation }: NotificationHeaderProps) => {
  return (
    <SafeAreaView edges={['top']}>
      <View className='flex-row items-center justify-between px-5 py-3.5'>
        {back ? (
          <TouchableOpacity onPress={() => navigation.goBack()} className='p-2'>
            <ChevronLeft className='text-black' size={32} />
          </TouchableOpacity>
        ) : (
          <View className='h-[48px] w-[48px] gap-[10px]' />
        )}
        <Text className='text-20b text-gray-900' style={{ lineHeight: 30 }}>
          {title}
        </Text>
        <View className='h-[48px] w-[48px] gap-[10px]' />
      </View>
    </SafeAreaView>
  );
};

export default NotificationHeader;

