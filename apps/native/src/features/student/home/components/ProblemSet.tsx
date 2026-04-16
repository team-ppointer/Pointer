import React, { useCallback, useMemo } from 'react';
import { CircleIcon, MinusIcon, TriangleIcon, XIcon } from 'lucide-react-native';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TextButton } from '@components/common';
import { type components } from '@schema';
import { colors, shadow } from '@theme/tokens';
import type { StudentRootStackParamList } from '@navigation/student/types';
import { useProblemSessionStore, getInitialScreenForPhase } from '@stores';
import { TrackedAnimatedPressable } from '@features/student/analytics';

type PublishDetail = components['schemas']['PublishResp'];
type PublishGroup = components['schemas']['PublishProblemGroupResp'];
type GroupProgress = PublishGroup['progress'];
type ProblemProgress = NonNullable<components['schemas']['ProblemWithStudyInfoResp']['progress']>;

interface ProblemSetProps {
  publishDetail?: PublishDetail;
}

interface ProblemItemProps {
  title: string;
  status?: ProblemProgress;
}

interface ProblemListProps {
  group: PublishGroup;
  unitTitle: string;
  index: number;
  onActionPress?: (group: PublishGroup) => void;
}

const Divider = () => {
  return <View className='h-px bg-gray-400' />;
};

const ProblemStatusIcon: Record<
  ProblemProgress,
  { Icon: typeof CircleIcon; color: string; bgColor: string }
> = {
  CORRECT: { Icon: CircleIcon, color: colors['green-500'], bgColor: 'bg-green-100' },
  SEMI_CORRECT: { Icon: TriangleIcon, color: colors['secondary-500'], bgColor: 'bg-secondary-100' },
  INCORRECT: { Icon: XIcon, color: colors['red-500'], bgColor: 'bg-red-100' },
  NONE: { Icon: MinusIcon, color: colors['gray-700'], bgColor: 'bg-gray-300' },
};

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

const ProblemItem = ({ title, status = 'NONE' }: ProblemItemProps) => {
  const { Icon, color, bgColor } = ProblemStatusIcon[status];

  return (
    <View className='flex-row items-center gap-[8px]'>
      <Text className='typo-body-2-medium text-black'>{title}</Text>
      <View className={`rounded-[4px] p-[4px] ${bgColor}`}>
        <Icon color={color} size={14} strokeWidth={2.5} />
      </View>
    </View>
  );
};

const ProblemList = ({ group, index, onActionPress, unitTitle }: ProblemListProps) => {
  const statusMeta = groupStatusMeta[group.progress];
  const handlePress = useCallback(() => {
    onActionPress?.(group);
  }, [group, onActionPress]);
  const problems = useMemo(() => {
    const childProblems = group.childProblems ?? [];
    return childProblems.map((child, childIndex) => ({
      key: `child-${child.id}-${childIndex}`,
      title: `${index + 1}-${childIndex + 1}번`,
      status: child.progress ?? 'NONE',
    }));
  }, [group, index]);

  const { Icon, color, bgColor } = ProblemStatusIcon[group.problem.progress ?? 'NONE'];

  return (
    <View
      className='flex-col gap-[12px] rounded-[10px] bg-white px-[14px] py-[10px]'
      style={shadow[100]}>
      <View className='flex-row items-center justify-between gap-[8px]'>
        <View className='flex-1 flex-col'>
          <View className='flex-row items-center'>
            <Text className='typo-heading-2-bold mr-[8px] text-black'>{`문제 ${index + 1}번`}</Text>
            <View className={`rounded-[4px] p-[4px] ${bgColor}`}>
              <Icon color={color} size={14} strokeWidth={2.5} />
            </View>
          </View>
          <Text className='typo-label-medium line-clamp-1 text-gray-700'>{unitTitle}</Text>
        </View>
        <TextButton variant={statusMeta.buttonVariant} onPress={handlePress} buttonId='start_study'>
          {statusMeta.buttonLabel}
        </TextButton>
      </View>
      {group.problem.progress === 'INCORRECT' && problems.length > 0 && <Divider />}
      {group.problem.progress === 'INCORRECT' &&
        problems.map((problem) => (
          <ProblemItem key={problem.key} title={problem.title} status={problem.status} />
        ))}
    </View>
  );
};

const ProblemSet = ({ publishDetail }: ProblemSetProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
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
      });
      const phase = useProblemSessionStore.getState().phase;
      navigation.navigate(getInitialScreenForPhase(phase));
    },
    [initWithResume, navigation, publishAt, publishId, title]
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
    return `${firstIncompleteInfo.index + 1}번부터 풀기`;
  }, [groups, allDone, firstIncompleteInfo]);

  return (
    <View className='bg-primary-100 gap-[10px] rounded-[20px] p-[16px] md:flex-1 md:basis-1/2'>
      {groups.length === 0 ? (
        <View className='h-full items-center justify-center'>
          <Text className='typo-body-1-regular text-center text-gray-700'>
            표시할 문제가 없어요
          </Text>
        </View>
      ) : (
        <>
          {startButtonLabel && (
            <TrackedAnimatedPressable
              buttonId='start_study'
              className='bg-primary-600 mb-[6px] h-[48px] items-center justify-center rounded-[8px] px-[20px]'
              onPress={handleStartFromFirst}>
              <Text className='typo-body-1-medium text-white'>{startButtonLabel}</Text>
            </TrackedAnimatedPressable>
          )}
          {groups.map((group, index) => {
            const key = group.problemId ?? index;
            return (
              <ProblemList
                group={group}
                index={index}
                unitTitle={title}
                onActionPress={handleGroupAction}
                key={key}
              />
            );
          })}
        </>
      )}
    </View>
  );
};

export default ProblemSet;
