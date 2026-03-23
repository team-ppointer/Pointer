import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Animated, type LayoutChangeEvent, ScrollView, Text, View } from 'react-native';
import { BookmarkIcon } from 'lucide-react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { colors, shadow } from '@theme/tokens';
import { type StudentRootStackParamList } from '@navigation/student/types';
import { TrackedAnimatedPressable, type ButtonId } from '@/features/student/analytics';
import { Container } from '@components/common';
import {
  postPointing,
  useGetScrapStatusById,
  useToggleScrapFromPointing,
  useToggleScrapFromProblem,
} from '@apis/student';
import {
  selectCurrentProblem,
  selectCurrentPointing,
  selectChildIndex,
  selectGroup,
  selectInitialized,
  selectPhase,
  selectPublishAt,
  selectPublishId,
  useProblemSessionStore,
} from '@stores/problemSessionStore';
import { useInvalidateStudyData } from '@hooks';

import Header from '../components/Header';
import BottomActionBar from '../components/BottomActionBar';
import ProblemViewer from '../components/ProblemViewer';

const PointingScreen = ({
  navigation,
}: Partial<NativeStackScreenProps<StudentRootStackParamList, 'Pointing'>>) => {
  type FeedbackStep = 'question' | 'comment' | 'done';
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const [feedbackStep, setFeedbackStep] = useState<FeedbackStep>('question');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPointingScraped, setIsPointingScraped] = useState(false);
  const [isProblemScraped, setIsProblemScraped] = useState(false);
  const scrapAnimValue = useRef(new Animated.Value(0)).current;
  const problemScrapAnimValue = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const phase = useProblemSessionStore(selectPhase);
  const problem = useProblemSessionStore(selectCurrentProblem);
  const pointing = useProblemSessionStore(selectCurrentPointing);
  const initialized = useProblemSessionStore(selectInitialized);
  const group = useProblemSessionStore(selectGroup);
  const childIndex = useProblemSessionStore(selectChildIndex);
  const publishId = useProblemSessionStore(selectPublishId);
  const publishAt = useProblemSessionStore(selectPublishAt);
  const pointingIndex = useProblemSessionStore((state) => state.pointingIndex);
  const pointingTarget = useProblemSessionStore((state) => state.pointingTarget);
  const nextPointing = useProblemSessionStore((state) => state.nextPointing);
  const resetSession = useProblemSessionStore((state) => state.reset);
  const { invalidateStudyData } = useInvalidateStudyData();
  const togglePointingScrapMutation = useToggleScrapFromPointing();
  const toggleProblemScrapMutation = useToggleScrapFromProblem();
  const { data: scrapStatusData } = useGetScrapStatusById(problem?.id ?? 0, !!problem?.id);

  // Scrap animation interpolation
  const scrapBgColor = scrapAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors['gray-200'], colors['gray-400']],
  });

  const total = useMemo(() => {
    if (!group || pointingTarget == null) {
      return 0;
    }
    if (pointingTarget === 'MAIN') {
      return group.problem.pointings?.length ?? 0;
    }
    const child = group.childProblems?.[childIndex];
    return child?.pointings?.length ?? 0;
  }, [childIndex, group, pointingTarget]);

  const index = pointingIndex;

  const problemTitle = useMemo(() => {
    if (!group) {
      return '';
    }
    if (phase === 'MAIN_POINTINGS') {
      return `실전 문제 ${group.no}번`;
    }
    if (phase === 'CHILD_POINTINGS') {
      const order = childIndex >= 0 ? childIndex + 1 : 0;
      return order > 0 ? `연습 문제 ${order}번` : '연습 문제';
    }
    return '';
  }, [childIndex, group, phase]);

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
    if (
      !group ||
      !problem ||
      !pointing ||
      (phase !== 'CHILD_POINTINGS' && phase !== 'MAIN_POINTINGS')
    ) {
      redirectToHome();
    }
  }, [group, initialized, phase, pointing, problem, redirectToHome]);

  const handleBottomBarLayout = useCallback((event: LayoutChangeEvent) => {
    setBottomBarHeight(event.nativeEvent.layout.height);
  }, []);

  const handleClose = useCallback(() => {
    goHome();
  }, [goHome]);

  useEffect(() => {
    if (pointing?.isQuestionUnderstood != null && pointing?.isCommentUnderstood != null) {
      setFeedbackStep('done');
    } else if (pointing?.isQuestionUnderstood != null) {
      setFeedbackStep('comment');
    } else {
      setFeedbackStep('question');
    }
    setIsSubmitting(false);
  }, [pointing?.id, pointing?.isQuestionUnderstood, pointing?.isCommentUnderstood]);

  // Sync scrap state with fetched data
  useEffect(() => {
    const scrappedPointingIds = scrapStatusData?.scrappedPointingIds ?? [];
    const isPointingScrapped = pointing?.id != null && scrappedPointingIds.includes(pointing.id);
    setIsPointingScraped(isPointingScrapped);
    scrapAnimValue.setValue(isPointingScrapped ? 1 : 0);
  }, [scrapStatusData?.scrappedPointingIds, pointing?.id, scrapAnimValue]);

  // Sync problem scrap state with fetched data
  useEffect(() => {
    const isProblemScrapped = scrapStatusData?.isProblemScrapped ?? false;
    setIsProblemScraped(isProblemScrapped);
    problemScrapAnimValue.setValue(isProblemScrapped ? 1 : 0);
  }, [scrapStatusData?.isProblemScrapped, problemScrapAnimValue]);

  const handleFeedbackSelection = useCallback(
    async (understood: boolean) => {
      if (!pointing?.id || isSubmitting) {
        return;
      }
      try {
        setIsSubmitting(true);
        const body = {
          pointingId: pointing.id,
          publishId: publishId ?? undefined,
          ...(feedbackStep === 'question'
            ? { isQuestionUnderstood: understood }
            : { isCommentUnderstood: understood }),
        };
        await postPointing(body);
        setFeedbackStep(feedbackStep === 'question' ? 'comment' : 'done');
      } catch (error) {
        console.error('Failed to submit pointing feedback', error);
        Alert.alert('학습 여부를 저장할 수 없어요.', '잠시 후 다시 시도해주세요.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, pointing?.id, publishId, feedbackStep]
  );

  const ctaLabel = useMemo(() => {
    if (index + 1 < total) {
      return '다음 포인팅';
    }
    if (phase === 'CHILD_POINTINGS') {
      if (!group) return '다음 문제';
      const mainCorrect = useProblemSessionStore.getState().mainCorrect;
      const childProblems = group.childProblems ?? [];
      const nextChildIndex = childIndex + 1;

      if (mainCorrect) {
        // 정답 경로: 다음 새끼 포인팅이 있으면 '다음 포인팅', 없으면 메인 포인팅/해설
        const hasMoreChildPointings = childProblems
          .slice(nextChildIndex)
          .some((child) => (child.pointings?.length ?? 0) > 0);
        if (hasMoreChildPointings) return '다음 포인팅';
        const mainPointingsCount = group.problem.pointings?.length ?? 0;
        return mainPointingsCount > 0 ? '포인팅 학습하기' : '해설 보기';
      }

      // 오답 경로: 다음 새끼문항이 있으면 '다음 문제', 없으면 '메인 문제 풀기'
      if (nextChildIndex < childProblems.length) return '다음 문제';
      return '메인 문제 풀기';
    }
    if (phase === 'MAIN_POINTINGS') {
      return '해설 보기';
    }
    return '계속';
  }, [childIndex, group, index, phase, total]);

  // Button ID for analytics tracking (only 'next_problem' when applicable)
  const ctaButtonId: ButtonId | undefined = ctaLabel === '다음 문제' ? 'next_problem' : undefined;

  const handleCtaPress = useCallback(() => {
    const prevPhase = useProblemSessionStore.getState().phase;
    nextPointing();
    const nextPhase = useProblemSessionStore.getState().phase;

    if (
      prevPhase === 'CHILD_POINTINGS' &&
      (nextPhase === 'CHILD_PROBLEM' || nextPhase === 'MAIN_PROBLEM_RETRY')
    ) {
      navigation?.replace('Problem');
    } else if (
      (prevPhase === 'CHILD_POINTINGS' || prevPhase === 'MAIN_POINTINGS') &&
      nextPhase === 'ANALYSIS'
    ) {
      navigation?.replace('Analysis');
    }
  }, [navigation, nextPointing]);

  const handleTogglePointingScrap = useCallback(() => {
    if (!pointing?.id || togglePointingScrapMutation.isPending) {
      return;
    }

    // Optimistic update with animation
    const previousState = isPointingScraped;
    const newScrapState = !previousState;
    setIsPointingScraped(newScrapState);
    Animated.spring(scrapAnimValue, {
      toValue: newScrapState ? 1 : 0,
      useNativeDriver: false,
      tension: 200,
      friction: 20,
    }).start();

    togglePointingScrapMutation.mutate(
      { pointingId: pointing.id },
      {
        onError: () => {
          // Revert to previous state on error
          setIsPointingScraped(previousState);
          Animated.spring(scrapAnimValue, {
            toValue: previousState ? 1 : 0,
            useNativeDriver: false,
            tension: 200,
            friction: 20,
          }).start();
          Alert.alert('스크랩 실패', '잠시 후 다시 시도해주세요.');
        },
      }
    );
  }, [pointing?.id, isPointingScraped, scrapAnimValue, togglePointingScrapMutation]);

  const handleToggleProblemScrap = useCallback(() => {
    if (!problem?.id || toggleProblemScrapMutation.isPending) {
      return;
    }

    // Optimistic update with animation
    const previousState = isProblemScraped;
    const newScrapState = !previousState;
    setIsProblemScraped(newScrapState);
    Animated.spring(problemScrapAnimValue, {
      toValue: newScrapState ? 1 : 0,
      useNativeDriver: false,
      tension: 200,
      friction: 20,
    }).start();

    toggleProblemScrapMutation.mutate(
      { problemId: problem.id },
      {
        onError: () => {
          // Revert to previous state on error
          setIsProblemScraped(previousState);
          Animated.spring(problemScrapAnimValue, {
            toValue: previousState ? 1 : 0,
            useNativeDriver: false,
            tension: 200,
            friction: 20,
          }).start();
          Alert.alert('스크랩 실패', '잠시 후 다시 시도해주세요.');
        },
      }
    );
  }, [problem?.id, isProblemScraped, problemScrapAnimValue, toggleProblemScrapMutation]);

  const pointingIndexLabel = total > 0 && index >= 0 ? String.fromCharCode(65 + index) : '';

  return (
    <View className='flex-1'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <Header onClose={handleClose}>
          <Header.TitleGroup>
            <Header.Title variant='accent'>포인팅 {pointingIndexLabel}</Header.Title>
            <Header.Title variant='secondary'>{problemTitle}</Header.Title>
          </Header.TitleGroup>
        </Header>
        <View className='flex-1'>
          <Container className='flex-1 flex-col gap-[20px] pb-[32px] md:flex-row'>
            <View className='md:flex-1'>
              <View
                className='rounded-[8px] border border-gray-500 bg-white p-[14px]'
                style={shadow[100]}>
                <View className='mb-[6px] flex-row justify-between gap-[10px]'>
                  <Text className='text-16sb text-gray-600'>문제 본문</Text>
                  <TrackedAnimatedPressable
                    buttonId={isProblemScraped ? 'remove_scrap' : 'add_scrap'}
                    className='h-[32px] w-[32px] items-center justify-center'
                    onPress={handleToggleProblemScrap}>
                    <BookmarkIcon
                      size={20}
                      color={isProblemScraped ? colors['gray-800'] : colors['gray-600']}
                      fill={isProblemScraped ? colors['gray-800'] : 'transparent'}
                    />
                  </TrackedAnimatedPressable>
                </View>
                <ProblemViewer
                  problemContent={problem?.problemContent ?? ''}
                  minHeight={200}
                  fontStyle='serif'
                />
              </View>
            </View>

            <ScrollView className='pb-[100px] md:flex-1' style={shadow[100]}>
              <View className='flex flex-col overflow-hidden rounded-[8px] border border-gray-400 bg-gray-200'>
                <View className='flex-col gap-[6px] border-b border-gray-400 bg-white p-[14px]'>
                  <View className='flex-row items-start justify-between'>
                    <View className='flex-row items-center'>
                      <Text className='text-16b mr-[4px] text-gray-800'>포인팅</Text>
                      <Text className='text-16b text-primary-500 mr-[8px]'>
                        {pointingIndexLabel}
                      </Text>
                      <Text className='text-13m text-gray-700'>포인팅 질문</Text>
                    </View>
                    <TrackedAnimatedPressable
                      buttonId={isPointingScraped ? 'remove_scrap' : 'add_scrap'}
                      className='h-[32px] w-[32px] items-center justify-center'
                      onPress={handleTogglePointingScrap}>
                      <BookmarkIcon
                        size={20}
                        color={isPointingScraped ? colors['gray-800'] : colors['gray-600']}
                        fill={isPointingScraped ? colors['gray-800'] : 'transparent'}
                      />
                    </TrackedAnimatedPressable>
                  </View>
                  <ProblemViewer problemContent={pointing?.questionContent ?? ''} />
                </View>
                {feedbackStep !== 'question' && (
                  <ProblemViewer problemContent={pointing?.commentContent ?? ''} padding={14} />
                )}
              </View>
            </ScrollView>
          </Container>
        </View>
        <BottomActionBar bottomInset={insets.bottom} onLayout={handleBottomBarLayout}>
          {feedbackStep === 'done' ? (
            <BottomActionBar.Button
              className='bg-primary-500 h-[42px]'
              containerStyle={{ flex: 1 }}
              onPress={handleCtaPress}
              buttonId={ctaButtonId}
              buttonLabel={ctaLabel}>
              <Text className='text-16m text-white'>{ctaLabel}</Text>
            </BottomActionBar.Button>
          ) : (
            <View className='flex-1 flex-row gap-[10px]'>
              <BottomActionBar.Button
                className={`bg-primary-500 h-[42px] ${isSubmitting ? 'opacity-60' : ''}`}
                containerStyle={{ flex: 1 }}
                disabled={isSubmitting}
                onPress={() => handleFeedbackSelection(true)}
                buttonId='confirm_pointing'
                buttonLabel='네'>
                <Text className='text-16m text-white'>네</Text>
              </BottomActionBar.Button>
              <BottomActionBar.Button
                className={`bg-primary-500 h-[42px] ${isSubmitting ? 'opacity-60' : ''}`}
                containerStyle={{ flex: 1 }}
                disabled={isSubmitting}
                onPress={() => handleFeedbackSelection(false)}
                buttonId='reject_pointing'
                buttonLabel='아니오'>
                <Text className='text-16m text-white'>아니오</Text>
              </BottomActionBar.Button>
            </View>
          )}
        </BottomActionBar>
      </SafeAreaView>
    </View>
  );
};

export default PointingScreen;
