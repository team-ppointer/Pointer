import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, View } from 'react-native';
import { XIcon } from 'lucide-react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { type StudentRootStackParamList } from '@navigation/student/types';
import {
  AnimatedPressable,
  Header,
  PointerContentView,
  type PointerContentViewHandle,
} from '@components/common';
import {
  selectGroup,
  selectInitialized,
  selectPublishAt,
  selectPublishId,
  useProblemSessionStore,
} from '@stores/problemSessionStore';
import useInvalidateStudyData from '@hooks/useInvalidateStudyData';
import {
  useGetScrapStatusById,
  useToggleScrapFromProblem,
  useToggleScrapFromReadingTip,
  useToggleScrapFromOneStepMore,
  useToggleScrapFromPointing,
} from '@apis/student';
import { client } from '@apis/client';

import ScrapItem from '../components/ScrapItem';
import { useSplitPanelLayout } from '../hooks/useSplitPanelLayout';
import { pointingFeedbackQueue } from '../services';
import {
  buildAnalysisOverviewSections,
  joinPointingsForAnalysis,
} from '../transforms/contentRendererTransforms';

const AnalysisScreen = ({
  navigation,
}: Partial<NativeStackScreenProps<StudentRootStackParamList, 'Analysis'>>) => {
  const insets = useSafeAreaInsets();

  const group = useProblemSessionStore(selectGroup);
  const initialized = useProblemSessionStore(selectInitialized);
  const publishId = useProblemSessionStore(selectPublishId);
  const publishAt = useProblemSessionStore(selectPublishAt);
  const resetSession = useProblemSessionStore((state) => state.reset);
  const { invalidateStudyData } = useInvalidateStudyData();

  const problemSubtitle = useMemo(() => {
    if (!group) {
      return '';
    }
    return `문제 ${group.no}번`;
  }, [group]);

  const redirectToHome = useCallback(() => {
    resetSession();
    navigation?.navigate('StudentTabs', { screen: 'Home' });
  }, [navigation, resetSession]);

  const goHome = useCallback(() => {
    resetSession();
    void invalidateStudyData(publishId, publishAt);
    navigation?.reset({
      index: 0,
      routes: [
        {
          name: 'StudentTabs',
          params: { screen: 'Home' },
        },
      ],
    });
  }, [invalidateStudyData, navigation, publishAt, publishId, resetSession]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    if (!group) {
      redirectToHome();
    }
  }, [group, initialized, redirectToHome]);

  const handleClose = useCallback(() => {
    goHome();
  }, [goHome]);

  const handlePrimaryAction = useCallback(() => {
    goHome();
  }, [goHome]);

  const queueSnapshot = pointingFeedbackQueue.snapshot();
  const joined = useMemo(() => (group ? joinPointingsForAnalysis(group) : []), [group]);
  const sections = useMemo(
    () =>
      group
        ? buildAnalysisOverviewSections({
            problem: group.problem,
            joined,
            pendingQueueEntries: queueSnapshot,
          })
        : [],
    [group, joined, queueSnapshot]
  );
  const initMessage = useMemo(
    () => ({ type: 'init' as const, mode: 'overview' as const, sections }),
    [sections]
  );

  const contentViewRef = useRef<PointerContentViewHandle>(null);

  const scrapSections = useMemo(
    () =>
      sections.filter(
        (s) =>
          s.id === 'reading' || s.id === 'one-step-more' || s.id.startsWith('pointing-divider-')
      ),
    [sections]
  );

  const getSectionLabel = (section: (typeof scrapSections)[number]): string => {
    if (section.display.type === 'card' && section.display.variant === 'default') {
      return section.display.displayLabel ?? '';
    }
    if (section.display.type === 'divider') {
      return section.display.text ?? '';
    }
    return '';
  };

  const queryClient = useQueryClient();
  const problemId = group?.problem.id;
  const { data: scrapStatus } = useGetScrapStatusById(problemId ?? 0, problemId != null);

  const toggleReadingTip = useToggleScrapFromReadingTip();
  const toggleOneStepMore = useToggleScrapFromOneStepMore();
  const togglePointing = useToggleScrapFromPointing();
  const toggleProblem = useToggleScrapFromProblem();

  const invalidateScrapStatus = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ['get', '/api/student/scrap/by-problem/{problemId}'],
    });
  }, [queryClient]);

  const getIsBookmarked = useCallback(
    (sectionId: string): boolean => {
      if (!scrapStatus) return false;
      if (sectionId === 'reading') return scrapStatus.isReadingTipScrapped ?? false;
      if (sectionId === 'one-step-more') return scrapStatus.isOneStepMoreScrapped ?? false;
      const match = /^pointing-divider-(\d+)$/.exec(sectionId);
      if (match) {
        const index = Number(match[1]);
        const pointingId = joined[index]?.pointing.id;
        return pointingId != null && (scrapStatus.scrappedPointingIds ?? []).includes(pointingId);
      }
      return false;
    },
    [scrapStatus, joined]
  );

  const handleBookmark = useCallback(
    (sectionId: string) => {
      if (!problemId) return;
      if (sectionId === 'reading') {
        toggleReadingTip.mutate({ problemId }, { onSuccess: invalidateScrapStatus });
        return;
      }
      if (sectionId === 'one-step-more') {
        toggleOneStepMore.mutate({ problemId }, { onSuccess: invalidateScrapStatus });
        return;
      }
      const match = /^pointing-divider-(\d+)$/.exec(sectionId);
      if (match) {
        const index = Number(match[1]);
        const pointingId = joined[index]?.pointing.id;
        if (pointingId != null) {
          togglePointing.mutate({ pointingId }, { onSuccess: invalidateScrapStatus });
        }
      }
    },
    [problemId, toggleReadingTip, toggleOneStepMore, togglePointing, joined, invalidateScrapStatus]
  );

  const childProblemIds = useMemo(
    () => (group?.childProblems ?? []).map((c) => c.id),
    [group?.childProblems]
  );

  const { data: childProblemScrapMap } = useQuery({
    queryKey: ['get', '/api/student/scrap/by-problem/{problemId}', 'children', ...childProblemIds],
    queryFn: async () => {
      const results = await Promise.all(
        childProblemIds.map((id) =>
          client.GET('/api/student/scrap/by-problem/{problemId}', {
            params: { path: { problemId: id } },
          })
        )
      );
      return Object.fromEntries(
        results.map((r, i) => [childProblemIds[i], r.data?.isProblemScrapped ?? false])
      ) as Record<number, boolean>;
    },
    enabled: childProblemIds.length > 0,
  });

  const problemScrapItems = useMemo(() => {
    if (!group) return [];
    const items: { id: number; label: string }[] = [
      { id: group.problem.id, label: `문제 ${group.no}번` },
    ];
    (group.childProblems ?? []).forEach((child, i) => {
      items.push({ id: child.id, label: `문제 ${group.no}-${i + 1}번` });
    });
    return items;
  }, [group]);

  const isProblemBookmarked = useCallback(
    (problemId: number): boolean => {
      if (problemId === group?.problem.id) return scrapStatus?.isProblemScrapped ?? false;
      return childProblemScrapMap?.[problemId] ?? false;
    },
    [group?.problem.id, scrapStatus, childProblemScrapMap]
  );

  const handleProblemBookmark = useCallback(
    (problemId: number) => {
      toggleProblem.mutate({ problemId }, { onSuccess: invalidateScrapStatus });
    },
    [toggleProblem, invalidateScrapStatus]
  );

  const { leftWidth, rightWidth } = useSplitPanelLayout();

  const primaryButtonLabel = '학습 완료';

  return (
    <View className='flex-1 flex-row bg-white'>
      <View
        className='bg-primary-100 rounded-r-[24px]'
        style={{ paddingTop: insets.top, width: leftWidth }}>
        <View className='flex-1 overflow-hidden rounded-r-[24px]'>
          <Header
            title={'학습 마무리'}
            subtitle={problemSubtitle}
            paddingHorizontal={{ left: 28, right: 16 }}
          />
          <PointerContentView ref={contentViewRef} initMessage={initMessage} />
        </View>
      </View>
      <View style={{ paddingTop: insets.top, width: rightWidth }}>
        <Header
          right={<Header.IconButton icon={XIcon} onPress={handleClose} />}
          paddingHorizontal={28}
        />
        <View className='flex-1 items-center px-[28px]' style={{ paddingBottom: insets.bottom }}>
          <View className='my-[12px] size-[120px] bg-gray-400' />
          <View className='mb-[8px] flex-row'>
            <Text className='typo-display-1-bold'>{problemSubtitle} </Text>
            <Text className='typo-display-1-bold text-primary-600'>완료!</Text>
          </View>
          <Text className='typo-body-1-medium mb-[40px] text-center text-gray-700'>
            {problemSubtitle} 학습을 완료하셨습니다.{'\n'}
            아래 스크랩을 통해 나만의 수학노트를 만들어봐요!
          </Text>
          <ScrollView
            className='mb-auto max-h-[180px] w-[320px] rounded-[18px] border border-gray-200 bg-gray-100'
            contentContainerClassName='gap-[8px] p-[16px]'>
            {problemScrapItems.map((item) => (
              <ScrapItem
                key={`problem-${item.id}`}
                title={item.label}
                isBookmarked={isProblemBookmarked(item.id)}
                onBookmark={() => handleProblemBookmark(item.id)}
              />
            ))}
            {scrapSections.map((section) => (
              <ScrapItem
                key={section.id}
                title={getSectionLabel(section)}
                isBookmarked={getIsBookmarked(section.id)}
                onPress={() => contentViewRef.current?.scrollToSection(section.id)}
                onBookmark={() => handleBookmark(section.id)}
              />
            ))}
          </ScrollView>
          <AnimatedPressable
            containerStyle={{ width: '100%', maxWidth: 420 }}
            className='mb-[8px] flex h-[48px] w-full items-center justify-center rounded-[8px] border border-gray-500 bg-gray-100'
            onPress={() => {
              goHome();
            }}>
            <Text className='typo-body-1-medium text-black'>홈으로 이동</Text>
          </AnimatedPressable>
          <AnimatedPressable
            containerStyle={{ width: '100%', maxWidth: 420 }}
            className='bg-primary-600 mb-[40px] flex h-[48px] items-center justify-center rounded-[8px]'
            onPress={handlePrimaryAction}>
            <Text className='typo-body-1-medium text-white'>{primaryButtonLabel}</Text>
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
};

export default AnalysisScreen;
