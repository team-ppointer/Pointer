import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { colors } from '@/theme/tokens';
import type { components } from '@/types/api/schema';
import ProfileIcon from '@/components/system/icons/ProfileIcon';

interface UserProfileCardProps {
  name?: string;
  school?: components['schemas']['SchoolResp'];
  grade?: string;
  onEditPress?: () => void;
}

const formatGrade = (grade?: string): string => {
  const gradeMap: Record<string, string> = {
    ONE: '1학년',
    TWO: '2학년',
    THREE: '3학년',
    N_TIME: 'N수생',
  };
  return grade ? gradeMap[grade] || grade : '';
};

export const UserProfileCard = ({ name, school, grade, onEditPress }: UserProfileCardProps) => {
  return (
    <View className='flex-row items-center justify-between px-4 py-2.5'>
      <View className='flex-row items-center gap-3'>
        <View className='bg-primary-200 h-[48px] w-[48px] items-center justify-center rounded-[82.76px]'>
          <ProfileIcon fill={colors['primary-500']} color={colors['primary-500']} />
        </View>
        <View className='flex-col '>
          <Text className='text-20b text-black'>{name}</Text>
          <Text className='text-16r text-gray-700'>{`${school?.name} ${formatGrade(grade)}`}</Text>
        </View>
      </View>
      <Pressable
        className='h-[30px] items-center justify-center rounded-[8px] bg-gray-400 px-[10px] py-[5px]'
        onPress={onEditPress}>
        <Text className='text-14m text-black'>수정</Text>
      </Pressable>
    </View>
  );
};
