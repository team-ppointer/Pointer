import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { colors } from '@theme/tokens';
import type { components } from '@schema';
import { ProfileIcon } from '@components/system/icons';
import { AnimatedPressable } from '@components/common';
import { gradeOptions } from '@features/student/onboarding/constants';

interface UserProfileCardProps {
  name?: string;
  school?: components['schemas']['SchoolResp'];
  grade?: string;
  onEditPress?: () => void;
}

export const UserProfileCard = ({ name, school, grade, onEditPress }: UserProfileCardProps) => {
  const schoolGradeLabel = useMemo(() => {
    const gradeLabel = gradeOptions.find((opt) => opt.value === grade)?.label ?? '';
    return school ? `${school.name} ${gradeLabel}` : gradeLabel;
  }, [school, grade]);

  return (
    <View className='flex-row items-center justify-between px-[16px] py-[10px]'>
      <View className='flex-row items-center gap-[12px]'>
        <View className='bg-primary-200 h-[48px] w-[48px] items-center justify-center rounded-full'>
          <ProfileIcon fill={colors['primary-500']} color={colors['primary-500']} />
        </View>
        <View className='flex-col'>
          <Text className='text-20b text-black'>{name}</Text>
          <Text className='text-16r text-gray-700'>{schoolGradeLabel}</Text>
        </View>
      </View>
      <AnimatedPressable
        className='h-[30px] items-center justify-center rounded-[8px] bg-gray-400 px-[10px] py-[5px]'
        onPress={onEditPress}>
        <Text className='text-14m text-black'>수정</Text>
      </AnimatedPressable>
    </View>
  );
};
