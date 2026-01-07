import React from 'react';
import { Text, View } from 'react-native';

interface DateDividerProps {
  date: string;
}

const DateDivider = ({ date }: DateDividerProps) => {
  return (
    <View className='flex-row items-center p-[16px]'>
      <View className='h-[1px] flex-1 bg-gray-500' />
      <Text className='text-10r px-[16px] text-gray-700'>{date}</Text>
      <View className='h-[1px] flex-1 bg-gray-500' />
    </View>
  );
};

export default DateDivider;
