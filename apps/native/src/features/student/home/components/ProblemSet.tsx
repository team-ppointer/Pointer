import React, { useCallback, useMemo, useState } from 'react';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleIcon,
  MinusIcon,
  TriangleIcon,
  XIcon,
} from 'lucide-react-native';
import { Alert, Pressable, Text, View } from 'react-native';

import { TextButton } from '@components/common';
import { components } from '@schema';
import { colors } from '@theme/tokens';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentRootStackParamList } from '@navigation/student/types';
import { useProblemSessionStore } from '@stores/problemSessionStore';

type PublishDetail = components['schemas']['PublishResp'];
type ProblemSetWithOptionalPublishAt = components['schemas']['ProblemSetResp'] & {
  publishAt?: string;
};
type PublishGroup = components['schemas']['PublishProblemGroupResp'];
type GroupProgress = PublishGroup['progress'];
type ProblemProgress = NonNullable<components['schemas']['ProblemWithStudyInfoResp']['progress']>;

interface NavigationProps {
  title: string;
  subtitle: string;
  onPressPrev: () => void;
  onPressNext: () => void;
}

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
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onActionPress?: (group: PublishGroup) => void;
}

const WEEKDAY_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const Navigation = ({ title, subtitle, onPressPrev, onPressNext }: NavigationProps) => {
  return (
    <View className='flex-row items-center justify-between px-[24px]'>
      <Pressable className='p-[8px]' onPress={onPressPrev}>
        <ChevronLeftIcon color={colors['gray-700']} size={32} strokeWidth={1.5} />
      </Pressable>
      <View className='flex-col items-center'>
        <Text className='text-13r text-black opacity-60'>{subtitle}</Text>
        <Text className='text-18b text-gray-900'>{title}</Text>
      </View>
      <Pressable className='p-[8px]' onPress={onPressNext}>
        <ChevronRightIcon color={colors['gray-700']} size={32} strokeWidth={1.5} />
      </Pressable>
    </View>
  );
};

const Divider = () => {
  return <View className='h-[1px] bg-gray-400' />;
};

const ProblemStatusIcon: Record<ProblemProgress, { Icon: typeof CircleIcon; color: string }> = {
  CORRECT: { Icon: CircleIcon, color: colors['green-500'] },
  SEMI_CORRECT: { Icon: TriangleIcon, color: colors['secondary-500'] },
  INCORRECT: { Icon: XIcon, color: colors['red-500'] },
  NONE: { Icon: MinusIcon, color: colors['gray-700'] },
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
  const { Icon, color } = ProblemStatusIcon[normalizedStatus];

  return (
    <View className='h-[42px] flex-row items-center justify-between'>
      <Text className='text-14r text-black'>{title}</Text>
      <View className='p-[4px]'>
        <Icon color={color} size={20} strokeWidth={2.5} />
      </View>
    </View>
  );
};

const ProblemList = ({ group, index, isExpanded, onToggle, onActionPress }: ProblemListProps) => {
  const statusMeta = groupStatusMeta[group.progress];
  const handlePress = useCallback(() => {
    if (!statusMeta.actionable) {
      return;
    }
    onActionPress?.(group);
  }, [group, onActionPress, statusMeta.actionable]);
  const problems = useMemo(() => {
    const childProblems = group.childProblems ?? [];
    return [
      {
        key: `main-${group.problemId}`,
        title: '실전 문제',
        status: group.problem.progress ?? 'NONE',
      },
      ...childProblems.map((child, childIndex) => ({
        key: `child-${child.id}-${childIndex}`,
        title: `연습 문제 ${childIndex + 1}`,
        status: child.progress ?? 'NONE',
      })),
    ];
  }, [group]);

  return (
    <View className='flex-col px-[24px]'>
      <View className='mb-[8px] flex-row items-center justify-between'>
        <Text className='text-16b mr-[12px] text-black'>{`${index + 1}번`}</Text>
        <Text className={`text-12sb mr-auto ${statusMeta.badgeClass}`}>{statusMeta.label}</Text>
        <TextButton variant={statusMeta.buttonVariant} onPress={handlePress}>
          {statusMeta.buttonLabel}
        </TextButton>
        <Pressable className='ml-[8px] p-[4px]' onPress={onToggle}>
          {isExpanded ? (
            <ChevronUpIcon color={colors['gray-700']} size={20} strokeWidth={1.5} />
          ) : (
            <ChevronDownIcon color={colors['gray-700']} size={20} strokeWidth={1.5} />
          )}
        </Pressable>
      </View>
      {isExpanded &&
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
      const isCurrentlyExpanded = prev[key] ?? true;
      return { ...prev, [key]: !isCurrentlyExpanded };
    });
  };

  const handleMoveDate = (offset: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + offset);
    onDateChange(nextDate);
  };

  const startSession = useProblemSessionStore((state) => state.init);

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
      startSession(group, {
        publishId,
        publishAt,
      });
      navigation.navigate('Problem');
    },
    [navigation, publishAt, publishId, startSession, title]
  );

  return (
    <View className='gap-[24px] rounded-[12px] bg-white pb-[24px] pt-[16px] shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)] md:flex-1 md:basis-1/2'>
      <Navigation
        title={title}
        subtitle={subtitle}
        onPressPrev={() => handleMoveDate(-1)}
        onPressNext={() => handleMoveDate(1)}
      />
      {groups.length === 0 ? (
        <View className='px-[24px] py-[40px]'>
          <Text className='text-14r text-center text-gray-600'>표시할 문제가 없어요.</Text>
        </View>
      ) : (
        groups.map((group, index) => {
          const key = group.problemId ?? index;
          const isExpanded = expandedGroups[key] ?? true;
          return (
            <View key={key} className='gap-[24px]'>
              <ProblemList
                group={group}
                index={index}
                isExpanded={isExpanded}
                onToggle={() => handleToggleGroup(key)}
                onActionPress={handleGroupAction}
              />
              {index < groups.length - 1 && <Divider />}
            </View>
          );
        })
      )}
    </View>
  );
};

export default ProblemSet;
