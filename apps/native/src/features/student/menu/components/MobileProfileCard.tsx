import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { AnimatedPressable } from '@components/common';
import { ProfileIcon } from '@/components/system/icons';
import { colors } from '@/theme/tokens';
import type { components } from '@schema';
import { gradeOptions } from '@features/student/onboarding/constants';

interface MobileProfileCardProps {
  name?: string;
  school?: components['schemas']['SchoolResp'];
  grade?: string;
  teacherName?: string;
  onEditPress?: () => void;
}

export const MobileProfileCard = ({
  name,
  school,
  grade,
  teacherName,
  onEditPress,
}: MobileProfileCardProps) => {
  const schoolGradeLabel = useMemo(
    () =>
      [school?.name, gradeOptions.find((opt) => opt.value === grade)?.label].filter(Boolean).join(' '),
    [school?.name, grade]
  );

  return (
    <View className='flex-1 gap-4 rounded-[20px] bg-blue-100 p-4'>
      <View className='flex-row items-center gap-1'>
        <View className='flex-row items-center gap-3'>
          <View className='bg-primary-200 h-[48px] w-[48px] items-center justify-center rounded-full'>
            <ProfileIcon fill={colors['primary-500']} color={colors['primary-500']} />
          </View>
          <Text className='text-20b text-right text-black'>{name}</Text>
        </View>
        <AnimatedPressable
          className='items-center justify-center rounded-[8px] px-[9px] py-[3px]'
          onPress={onEditPress}>
          <ChevronRight size={20} color={colors['gray-600']} />
        </AnimatedPressable>
      </View>
      <View className='flex-row items-center gap-2'>
        <View className='flex-[0.5] gap-0.5 rounded-[12px] bg-white px-3 py-2.5'>
          <Text className='text-13r text-gray-700'>고등학교 / 학년</Text>
          <Text className='text-16m text-black'>
            {schoolGradeLabel}
          </Text>
        </View>
        <View className='flex-[0.5] gap-0.5 rounded-[12px] bg-white px-3 py-2.5'>
          <Text className='text-13r text-gray-700'>내 선생님</Text>
          {teacherName ? (
            <Text className='text-16m text-black'>{`${teacherName} 선생님`}</Text>
          ) : (
            <Text className='text-16m text-gray-700'>등록된 선생님이 없어요</Text>
          )}
        </View>
      </View>
    </View>
  );
};
