import React from 'react';
import { Text, View } from 'react-native';

interface TeacherInfoCardProps {
  teacherName?: string;
}

export const TeacherInfoCard = ({ teacherName }: TeacherInfoCardProps) => {
  return (
    <View className='h-[72px] rounded-[12px] bg-[#ECF0FB] px-4 py-3'>
      <View className='flex-row gap-3'>
        <View className='flex-col '>
          <Text className='text-14r text-gray-700'>내 선생님</Text>
          <Text className='text-18m text-black'>{`${teacherName} 선생님`}</Text>
        </View>
      </View>
    </View>
  );
};
