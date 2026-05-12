import React, { useCallback, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react-native';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AnimatedPressable, TextButton } from '@components/common';
import { type components } from '@schema';
import { colors, shadow } from '@theme/tokens';
import type { StudentRootStackParamList } from '@navigation/student/types';
import { useProblemSessionStore, getInitialScreenForPhase, useHomeStore } from '@stores';
import { TrackedAnimatedPressable } from '@features/student/analytics';

type PublishDetail = components['schemas']['PublishResp'];
type PublishGroup = components['schemas']['PublishProblemGroupResp'];
type GroupProgress = PublishGroup['progress'];

interface ProblemSetProps {
  publishDetail?: PublishDetail;
  onPressDate?: () => void;
}

interface ProblemListProps {
  group: PublishGroup;
  unitTitle: string;
  index: number;
  onActionPress?: (group: PublishGroup) => void;
}

interface FocusBadgeProps {
  variant: 'orange' | 'green' | 'purple' | 'pink' | 'blue';
}

const groupStatusMeta: Record<
  GroupProgress,
  {
    buttonLabel: string;
    buttonVariant: 'blue' | 'gray' | 'outline';
  }
> = {
  DONE: {
    buttonLabel: '포인팅 모아보기',
    buttonVariant: 'outline',
  },
  DOING: {
    buttonLabel: '이어서 학습하기',
    buttonVariant: 'gray',
  },
  NONE: {
    buttonLabel: '문제 풀기',
    buttonVariant: 'blue',
  },
};

const focusBadgeColors: Record<FocusBadgeProps['variant'], { background: string; text: string }> = {
  orange: { background: '#FFEFE0', text: '#B85600' },
  green: { background: '#E5F4E1', text: '#1A6714' },
  purple: { background: '#EEE9FF', text: '#5B2EA6' },
  pink: { background: '#FCE8F3', text: '#9B2C6E' },
  blue: { background: '#E8F0FF', text: '#0055CC' },
};

const FocusBadge = ({ variant }: FocusBadgeProps) => (
  <View
    className='rounded-[4px] px-[4px] py-[2px]'
    style={{ backgroundColor: focusBadgeColors[variant].background }}>
    <Text className='typo-label-medium' style={{ color: focusBadgeColors[variant].text }}>
      집중학습
    </Text>
  </View>
);

const ProblemItem = ({ group, index, onActionPress }: ProblemListProps) => {
  const statusMeta = groupStatusMeta[group.progress];
  const handlePress = useCallback(() => {
    onActionPress?.(group);
  }, [group, onActionPress]);

  return (
    <View
      className='flex-row items-center justify-between gap-[8px] rounded-[10px] bg-white p-[12px]'
      style={shadow[100]}>
      <View className='flex-1 flex-row items-center gap-[8px]'>
        <FocusBadge variant='orange' />
        <Text className='typo-body-1-medium mr-[8px] text-black'>{`문제 ${index + 1}번`}</Text>
      </View>
      <TextButton variant={statusMeta.buttonVariant} onPress={handlePress} buttonId='start_study'>
        {statusMeta.buttonLabel}
      </TextButton>
    </View>
  );
};

const ProblemSet = ({ publishDetail, onPressDate }: ProblemSetProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { selectedMonth, selectedDate, setSelectedMonth, setSelectedDate } = useHomeStore();

  const handlePrevDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    if (
      newDate.getMonth() !== selectedMonth.getMonth() ||
      newDate.getFullYear() !== selectedMonth.getFullYear()
    ) {
      setSelectedMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  }, [selectedDate, selectedMonth, setSelectedDate, setSelectedMonth]);

  const handleNextDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    if (
      newDate.getMonth() !== selectedMonth.getMonth() ||
      newDate.getFullYear() !== selectedMonth.getFullYear()
    ) {
      setSelectedMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  }, [selectedDate, selectedMonth, setSelectedDate, setSelectedMonth]);
  const groups = publishDetail?.data ?? [];
  const title = publishDetail?.problemSet?.title ?? '미출제';
  const publishAt = publishDetail?.publishAt;
  const publishId = publishDetail?.id;

  const initWithResume = useProblemSessionStore((state) => state.initWithResume);

  const handleGroupAction = useCallback(
    (group: PublishGroup) => {
      if (group.progress === 'DONE') {
        navigation.navigate('AllPointings', {
          group,
          publishAt,
          problemSetTitle: title,
        });
        return;
      }
      initWithResume(group, {
        publishId,
        publishAt,
        problemSetTitle: title,
        problemSetGroups: groups,
      });
      const phase = useProblemSessionStore.getState().phase;
      navigation.navigate(getInitialScreenForPhase(phase));
    },
    [groups, initWithResume, navigation, publishAt, publishId, title]
  );

  // 첫 번째 미완료 문제 찾기 (DOING 또는 NONE 상태)
  const firstIncompleteInfo = useMemo(() => {
    const index = groups.findIndex((group) => group.progress !== 'DONE');
    if (index === -1) {
      // 모든 문제 완료 시 첫 번째 문제 반환
      return { index: 0, group: groups[0] };
    }
    return { index, group: groups[index] };
  }, [groups]);

  const handleStartFromFirst = useCallback(() => {
    const { group } = firstIncompleteInfo;
    if (!group) {
      Alert.alert('진행할 문제가 없어요.');
      return;
    }
    handleGroupAction(group);
  }, [firstIncompleteInfo, handleGroupAction]);

  // 모든 문제 완료 여부
  const allDone = useMemo(
    () => groups.length > 0 && groups.every((group) => group.progress === 'DONE'),
    [groups]
  );

  // 버튼 레이블 결정 (allDone이면 버튼 숨김)
  const startButtonLabel = useMemo(() => {
    if (groups.length === 0 || allDone) return null;
    return `문제 ${firstIncompleteInfo.index + 1}번부터 풀기`;
  }, [groups, allDone, firstIncompleteInfo]);

  return (
    <View className='bg-primary-100 gap-[20px] rounded-[20px] p-[16px]'>
      <View className='flex-col gap-[10px]'>
        {/* 날짜 헤더 */}
        <View className='flex-row items-center justify-between'>
          <AnimatedPressable
            className='size-[40px] items-start justify-center'
            onPress={handlePrevDay}>
            <ChevronLeftIcon size={20} color={colors['gray-700']} style={{ margin: 4 }} />
          </AnimatedPressable>
          <AnimatedPressable className='flex-row' onPress={onPressDate}>
            <Text className='typo-title-2-semibold text-gray-900'>
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일{' '}
            </Text>
            <Text className='typo-title-2-semibold text-gray-700'>
              {['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()]}요일
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            className='size-[40px] items-end justify-center'
            onPress={handleNextDay}>
            <ChevronRightIcon size={20} color={colors['gray-700']} style={{ margin: 4 }} />
          </AnimatedPressable>
        </View>
        {/* CTA */}
        {startButtonLabel && (
          <TrackedAnimatedPressable
            buttonId='start_study'
            className='bg-primary-600 h-[50px] flex-row items-center justify-between rounded-[8px] px-[20px]'
            onPress={handleStartFromFirst}>
            <Text className='typo-body-1-medium text-white'>{startButtonLabel}</Text>
            <ChevronRightIcon size={20} color='white' />
          </TrackedAnimatedPressable>
        )}
      </View>
      {/* 문제 리스트 */}
      {groups.length === 0 ? (
        <View className='items-center justify-center'>
          <Text className='typo-body-1-regular text-center text-gray-700'>
            표시할 문제가 없어요
          </Text>
        </View>
      ) : (
        <View className='flex-col gap-[12px] pb-[20px]'>
          <Text className='typo-heading-1-bold'>{title}</Text>
          {groups.map((group, index) => {
            const key = group.problemId ?? index;
            return (
              <ProblemItem
                group={group}
                index={index}
                unitTitle={title}
                onActionPress={handleGroupAction}
                key={key}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ProblemSet;
