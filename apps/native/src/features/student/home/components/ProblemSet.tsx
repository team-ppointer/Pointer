import React, { useCallback, useMemo, useState } from 'react';
import { CircleIcon, MinusIcon, TriangleIcon, XIcon } from 'lucide-react-native';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TextButton } from '@components/common';
import { TrackedAnimatedPressable } from '@/features/student/analytics';
import { type components } from '@schema';
import { colors, shadow } from '@theme/tokens';
import type { StudentRootStackParamList } from '@navigation/student/types';
import { useProblemSessionStore, getInitialScreenForPhase } from '@stores';

type PublishDetail = components['schemas']['PublishResp'];
type ProblemSetWithOptionalPublishAt = components['schemas']['ProblemSetResp'] & {
  publishAt?: string;
};
type PublishGroup = components['schemas']['PublishProblemGroupResp'];
type GroupProgress = PublishGroup['progress'];
type ProblemProgress = NonNullable<components['schemas']['ProblemWithStudyInfoResp']['progress']>;

interface ProblemSetProps {
  publishDetail?: PublishDetail;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

interface ProblemItemProps {
  title: string;
  status?: ProblemProgress;
}

interface ProblemListProps {
  group: PublishGroup;
  unitTitle: string;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onActionPress?: (group: PublishGroup) => void;
}

const WEEKDAY_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const Divider = () => {
  return <View className='h-[1px] bg-gray-400' />;
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
    label: string;
    badgeClass: string;
    buttonLabel: string;
    buttonVariant: 'blue' | 'gray' | 'outline';
    actionable: boolean;
  }
> = {
  DONE: {
    label: '학습 완료',
    badgeClass: 'text-green-500',
    buttonLabel: '포인팅 모아보기',
    buttonVariant: 'outline',
    actionable: true,
  },
  DOING: {
    label: '학습 중',
    badgeClass: 'text-blue-500',
    buttonLabel: '이어서 풀기',
    buttonVariant: 'gray',
    actionable: true,
  },
  NONE: {
    label: '학습 전',
    badgeClass: 'text-gray-800',
    buttonLabel: '문제 풀기',
    buttonVariant: 'blue',
    actionable: true,
  },
};

const ProblemItem = ({ title, status = 'NONE' }: ProblemItemProps) => {
  const normalizedStatus: ProblemProgress = status ?? 'NONE';
  const { Icon, color, bgColor } = ProblemStatusIcon[normalizedStatus];

  return (
    <View className='flex-row items-center gap-[8px] py-[2px]'>
      <Text className='text-16m text-black'>{title}</Text>
      <View className={`rounded-[4px] p-[4px] ${bgColor}`}>
        <Icon color={color} size={14} strokeWidth={2.5} />
      </View>
    </View>
  );
};

const ProblemList = ({ group, index, onToggle, onActionPress, unitTitle }: ProblemListProps) => {
  const statusMeta = groupStatusMeta[group.progress];
  const handlePress = useCallback(() => {
    if (!statusMeta.actionable) {
      return;
    }
    onActionPress?.(group);
  }, [group, onActionPress, statusMeta.actionable]);
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
      <View className='flex-row items-center justify-between'>
        <View className='flex-col'>
          <View className='flex-row items-center'>
            <Text className='text-16b mr-[8px] text-black'>{`문제 ${index + 1}번`}</Text>
            <View className={`rounded-[4px] p-[4px] ${bgColor}`}>
              <Icon color={color} size={14} strokeWidth={2.5} />
            </View>
          </View>
          <Text className='text-13r text-gray-700'>{unitTitle}</Text>
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

const formatPublishDate = (publishAt?: string, fallbackDate?: Date) => {
  const baseDate = publishAt ? new Date(publishAt) : fallbackDate;
  if (!baseDate || Number.isNaN(baseDate.getTime())) return '';
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const day = String(baseDate.getDate()).padStart(2, '0');
  const weekday = WEEKDAY_LABELS[baseDate.getDay()];
  return `${month}월 ${day}일 ${weekday}`;
};

const ProblemSet = ({ publishDetail, selectedDate, onDateChange }: ProblemSetProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  const groups = publishDetail?.data ?? [];
  const title = publishDetail?.problemSet?.title ?? '미출제';
  const publishAt =
    (publishDetail?.problemSet as ProblemSetWithOptionalPublishAt | undefined)?.publishAt ??
    publishDetail?.publishAt;
  const subtitle = formatPublishDate(publishAt, selectedDate);
  const publishId = publishDetail?.id;

  const handleToggleGroup = (key: number) => {
    setExpandedGroups((prev) => {
      const isCurrentlyExpanded = prev[key] ?? false;
      return { ...prev, [key]: !isCurrentlyExpanded };
    });
  };

  const handleMoveDate = (offset: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + offset);
    onDateChange(nextDate);
  };

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
      if (!group) {
        Alert.alert('진행할 문제가 없어요.');
        return;
      }
      initWithResume(group, {
        publishId,
        publishAt,
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
    <View className='gap-[12px] rounded-[20px] bg-blue-100 p-[16px] md:flex-1 md:basis-1/2'>
      {groups.length === 0 ? (
        <View className='h-full items-center justify-center'>
          <Text className='text-14r text-center text-gray-600'>표시할 문제가 없어요.</Text>
        </View>
      ) : (
        <>
          {startButtonLabel && (
            <TrackedAnimatedPressable
              buttonId='start_study'
              className='bg-primary-500 mb-[4px] items-center justify-center rounded-[8px] p-[12px]'
              onPress={handleStartFromFirst}
              style={shadow[100]}>
              <Text className='text-16m text-white'>{startButtonLabel}</Text>
            </TrackedAnimatedPressable>
          )}
          {groups.map((group, index) => {
            const key = group.problemId ?? index;
            const isExpanded = expandedGroups[key] ?? false;
            return (
              <View key={key}>
                <ProblemList
                  group={group}
                  index={index}
                  unitTitle={title}
                  isExpanded={isExpanded}
                  onToggle={() => handleToggleGroup(key)}
                  onActionPress={handleGroupAction}
                />
              </View>
            );
          })}
        </>
      )}
    </View>
  );
};

export default ProblemSet;
