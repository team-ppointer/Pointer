import { Alert, Text, View } from 'react-native';
import { XIcon } from 'lucide-react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AnswerEventPayload } from '@repo/pointer-content-renderer';

import { shadow } from '@theme/tokens';
import { type StudentRootStackParamList } from '@navigation/student/types';
import { Header } from '@components/common';
import {
  getInitialScreenForPhase,
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

import BottomActionBar from '../components/BottomActionBar';
import { PointerContentView } from '../components/PointerContentView';
import { useSplitPanelLayout } from '../hooks/useSplitPanelLayout';
import { pointingFeedbackQueue } from '../services';
import {
  buildDocumentInit,
  toChatScenario,
  toUserAnswers,
} from '../transforms/contentRendererTransforms';

const PointingScreen = ({
  navigation,
}: Partial<NativeStackScreenProps<StudentRootStackParamList, 'Pointing'>>) => {
  const phase = useProblemSessionStore(selectPhase);
  const currentProblem = useProblemSessionStore(selectCurrentProblem);
  const initialized = useProblemSessionStore(selectInitialized);
  const group = useProblemSessionStore(selectGroup);
  const childIndex = useProblemSessionStore(selectChildIndex);
  const publishId = useProblemSessionStore(selectPublishId);
  const publishAt = useProblemSessionStore(selectPublishAt);
  const problemSetTitle = useProblemSessionStore(selectProblemSetTitle);
  const completeAllPointings = useProblemSessionStore((state) => state.completeAllPointings);
  const resetSession = useProblemSessionStore((state) => state.reset);
  const { invalidateStudyData } = useInvalidateStudyData();

  const pointings = useMemo(() => currentProblem?.pointings ?? [], [currentProblem?.pointings]);

  if (pointings.length === 0) console.warn('[PointingScreen] empty pointings array');

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

  const [isPointingDone, setIsPointingDone] = useState(false);

  const handleComplete = useCallback(() => {
    setIsPointingDone(true);
  }, []);

  useEffect(() => {
    setIsPointingDone(false);
  }, [currentProblem?.id]);

  const handleAdvance = useCallback(() => {
    completeAllPointings();
  }, [completeAllPointings]);

  const ctaLabel = phase === 'MAIN_POINTINGS' ? '학습 마무리' : '다음 문제';

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

  const badgeStatus = useMemo(() => {
    const progress = currentProblem?.progress;
    if (progress === 'CORRECT') return 'correct' as const;
    if (progress === 'INCORRECT') return 'incorrect' as const;
    return;
  }, [currentProblem?.progress]);

  const { leftWidth, rightWidth } = useSplitPanelLayout();

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
    if (!group || !currentProblem) {
      redirectToHome();
      return;
    }
    if (phase === 'CHILD_POINTINGS' || phase === 'MAIN_POINTINGS') {
      return;
    }

    const target = getInitialScreenForPhase(phase);
    if (target === 'Pointing') {
      return;
    }
    navigation?.navigate(target);
  }, [currentProblem, group, initialized, phase, navigation, redirectToHome]);

  return (
    <View className='flex-1 bg-white'>
      <View className='flex-1 flex-row'>
        <View
          className='bg-primary-100 border-primary-200 m-[10px] rounded-[24px] border pt-[22px]'
          style={[shadow[400], { width: leftWidth }]}>
          <View className='flex-1 overflow-hidden rounded-[24px]'>
            <Header
              title='포인팅'
              paddingHorizontal={{ left: 28, right: 16 }}
              right={
                <Header.IconButton
                  icon={XIcon}
                  onPress={() =>
                    Alert.alert('여기까지 보고 나갈까요?', '이어서 학습할 수 있어요', [
                      { text: '나가기', onPress: goHome, style: 'destructive' },
                      { text: '계속 풀기', style: 'cancel' },
                    ])
                  }
                />
              }
            />
            <PointerContentView
              initMessage={chatInitMessage}
              onAnswer={handleAnswer}
              onComplete={handleComplete}
            />
          </View>
        </View>

        <View className='pt-[32px]' style={{ width: rightWidth, paddingLeft: 28 }}>
          <Header
            title={problemSetTitle}
            subtitle={problemSubtitle}
            badge={badgeStatus}
            paddingHorizontal={0}
          />
          <PointerContentView
            initMessage={documentInitMessage}
            minHeight={200}
            style={{ marginTop: 20, maxWidth: 720 }}
          />
          {isPointingDone && (
            <View className='pt-[16px]'>
              <BottomActionBar.Button className='bg-primary-500 self-start' onPress={handleAdvance}>
                <Text className='typo-title-1-bold text-white'>{ctaLabel}</Text>
              </BottomActionBar.Button>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default PointingScreen;
