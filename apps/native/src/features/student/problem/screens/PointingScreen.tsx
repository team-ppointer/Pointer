import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Animated, Text, View } from 'react-native';
import { BookmarkIcon, XIcon } from 'lucide-react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnswerEventPayload } from '@repo/pointer-content-renderer';

import { colors, shadow } from '@theme/tokens';
import { type StudentRootStackParamList } from '@navigation/student/types';
import { ContentInset, Header } from '@components/common';
import { useGetScrapStatusById, useToggleScrapFromProblem } from '@apis/student';
import {
  selectCurrentProblem,
  selectChildIndex,
  selectGroup,
  selectInitialized,
  selectPhase,
  selectPublishAt,
  selectPublishId,
  selectProblemSetTitle,
  useProblemSessionStore,
} from '@stores/problemSessionStore';
import { useInvalidateStudyData } from '@hooks';
import { TrackedAnimatedPressable } from '@/features/student/analytics';

import { PointerContentView } from '../components/PointerContentView';
import { pointingFeedbackQueue } from '../services';
import {
  buildDocumentInit,
  toChatScenario,
  toUserAnswers,
} from '../transforms/contentRendererTransforms';

const PointingScreen = ({
  navigation,
}: Partial<NativeStackScreenProps<StudentRootStackParamList, 'Pointing'>>) => {
  const [isProblemScraped, setIsProblemScraped] = useState(false);
  const problemScrapAnimValue = useRef(new Animated.Value(0)).current;

  const phase = useProblemSessionStore(selectPhase);
  const currentProblem = useProblemSessionStore(selectCurrentProblem);
  const initialized = useProblemSessionStore(selectInitialized);
  const group = useProblemSessionStore(selectGroup);
  const childIndex = useProblemSessionStore(selectChildIndex);
  const publishId = useProblemSessionStore(selectPublishId);
  const publishAt = useProblemSessionStore(selectPublishAt);
  const problemSetTitle = useProblemSessionStore(selectProblemSetTitle);
  const finishChildProblem = useProblemSessionStore((state) => state.finishChildProblem);
  const goToAnalysis = useProblemSessionStore((state) => state.goToAnalysis);
  const resetSession = useProblemSessionStore((state) => state.reset);
  const { invalidateStudyData } = useInvalidateStudyData();
  const toggleProblemScrapMutation = useToggleScrapFromProblem();
  const { data: scrapStatusData } = useGetScrapStatusById(
    currentProblem?.id ?? 0,
    !!currentProblem?.id
  );

  const pointings = useMemo(() => currentProblem?.pointings ?? [], [currentProblem?.pointings]);

  if (pointings.length === 0) console.warn('[PointingScreen] empty pointings array');

  // Chat WebView 는 init 후 내부 상태로 자체 진행한다. userAnswers 는 resume 용으로
  // mount 시점의 큐 + 서버 상태 한 번만 읽어 보내고, 이후 큐 변화에는 구독하지 않는다.
  // 구독 시 매 응답마다 initMessage reference 가 갱신되어 WebView 가 init 부터
  // 재시작되는 회귀 발생 (chat-controller 가 static phase 부터 다시 재생).
  const chatInitMessage = useMemo(
    () => ({
      type: 'init' as const,
      mode: 'chat' as const,
      scenario: toChatScenario(pointings),
      userAnswers: toUserAnswers(pointings, pointingFeedbackQueue.snapshot()),
    }),
    [pointings]
  );

  const documentInitMessage = useMemo(
    () =>
      buildDocumentInit({
        content: currentProblem?.problemContent ?? '',
        fontStyle: 'serif',
      }),
    [currentProblem?.problemContent]
  );

  const handleAnswer = useCallback(
    (e: AnswerEventPayload) => {
      if (publishId == null) return;
      pointingFeedbackQueue.enqueue({
        publishId,
        pointingId: Number(e.pointingId),
        step: e.step,
        value: e.response === 'yes',
      });
    },
    [publishId]
  );

  const handleComplete = useCallback(() => {
    if (phase === 'CHILD_POINTINGS') {
      finishChildProblem();
    } else if (phase === 'MAIN_POINTINGS') {
      goToAnalysis();
    }
  }, [phase, finishChildProblem, goToAnalysis]);

  const problemSubtitle = useMemo(() => {
    if (!group) {
      return '';
    }
    if (phase === 'MAIN_POINTINGS') {
      return `문제 ${group.no}번`;
    }
    if (phase === 'CHILD_POINTINGS') {
      const order = childIndex >= 0 ? childIndex + 1 : 0;
      return order > 0 ? `문제 ${group.no}-${order}번` : `문제 ${group.no}번`;
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
    if (!group || !currentProblem || (phase !== 'CHILD_POINTINGS' && phase !== 'MAIN_POINTINGS')) {
      redirectToHome();
    }
  }, [currentProblem, group, initialized, phase, redirectToHome]);

  const handleClose = useCallback(() => {
    goHome();
  }, [goHome]);

  // Sync problem scrap state with fetched data
  useEffect(() => {
    const isProblemScrapped = scrapStatusData?.isProblemScrapped ?? false;
    setIsProblemScraped(isProblemScrapped);
    problemScrapAnimValue.setValue(isProblemScrapped ? 1 : 0);
  }, [scrapStatusData?.isProblemScrapped, problemScrapAnimValue]);

  const handleToggleProblemScrap = useCallback(() => {
    if (!currentProblem?.id || toggleProblemScrapMutation.isPending) {
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
      { problemId: currentProblem.id },
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
  }, [currentProblem?.id, isProblemScraped, problemScrapAnimValue, toggleProblemScrapMutation]);

  return (
    <View className='flex-1'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <Header
          title={problemSetTitle}
          subtitle={problemSubtitle}
          right={<Header.IconButton icon={XIcon} onPress={handleClose} />}
        />
        <View className='flex-1'>
          <ContentInset className='flex-1 flex-col gap-[20px] pb-[32px] md:flex-row'>
            <View className='md:flex-1'>
              <View
                className='rounded-[8px] border border-gray-500 bg-white p-[14px]'
                style={shadow[100]}>
                <View className='mb-[6px] flex-row justify-between gap-[10px]'>
                  <Text className='text-16sb text-gray-600'>문제 본문</Text>
                  <TrackedAnimatedPressable
                    buttonId={isProblemScraped ? 'remove_scrap' : 'add_scrap'}
                    className='size-[32px] items-center justify-center'
                    onPress={handleToggleProblemScrap}>
                    <BookmarkIcon
                      size={20}
                      color={isProblemScraped ? colors['gray-800'] : colors['gray-600']}
                      fill={isProblemScraped ? colors['gray-800'] : 'transparent'}
                    />
                  </TrackedAnimatedPressable>
                </View>
                <PointerContentView initMessage={documentInitMessage} minHeight={200} />
              </View>
            </View>

            <View className='flex-1 md:flex-1' style={shadow[100]}>
              <PointerContentView
                initMessage={chatInitMessage}
                onAnswer={handleAnswer}
                onComplete={handleComplete}
              />
            </View>
          </ContentInset>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default PointingScreen;
