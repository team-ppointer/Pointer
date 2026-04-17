import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type BottomSheet from '@gorhom/bottom-sheet';
import { BookmarkIcon, XIcon } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
// TODO: runOnJS는 reanimated 4.x에서 deprecated. useAnimatedReaction 콜백 방식으로 교체 필요.
import { runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContentInset, Header, PointerContentView } from '@components/common';
import { postAnswer, useGetScrapStatusById, useToggleScrapFromProblem } from '@apis/student';
import type { StudentRootStackParamList } from '@navigation/student/types';
import { useInvalidateStudyData } from '@hooks';
import { type components } from '@schema';
import {
  MAX_RETRY_ATTEMPTS,
  selectChildIndex,
  selectCurrentProblem,
  selectGroup,
  selectInitialized,
  selectPhase,
  selectPublishAt,
  selectPublishId,
  selectProblemSetTitle,
  useProblemSessionStore,
} from '@stores/problemSessionStore';
import { colors } from '@theme/tokens';

import ResultSheet from '../components/ResultSheet';
import AnswerKeyboardSheet from '../components/AnswerKeyboardSheet';
import BottomActionBar from '../components/BottomActionBar';
import { buildDocumentInit } from '../transforms/contentRendererTransforms';
import { DrawingCanvas, type DrawingCanvasRef } from '../../scrap/utils/skia';
import { useDrawingState } from '../../scrap/hooks/useDrawingState';
import { ProblemDrawingToolbar } from '../components/ProblemDrawingToolbar';
import { ConfirmationModal } from '../../scrap/components/Dialog';

type ProblemScreenProps = Partial<NativeStackScreenProps<StudentRootStackParamList, 'Problem'>>;

type ProblemProgress = components['schemas']['ProblemWithStudyInfoResp']['progress'];

const ProblemScreen = ({ navigation }: ProblemScreenProps) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const resultSheetRef = useRef<BottomSheet>(null);
  const keyboardSheetIndex = useSharedValue(-1);
  const resultSheetIndex = useSharedValue(-1);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [answer, setAnswer] = useState('');
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const [isResultSheetVisible, setResultSheetVisible] = useState(false);
  const [isCloseVisible, setIsCloseVisible] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAttemptCount, setLastAttemptCount] = useState(0);
  const [problemProgress, setProblemProgress] = useState<ProblemProgress | null>(null);
  const [isScraped, setIsScraped] = useState(false);
  const scrapAnimValue = useRef(new Animated.Value(0)).current;
  const actionBarFade = useRef(new Animated.Value(0)).current;

  const phase = useProblemSessionStore(selectPhase);
  const currentProblem = useProblemSessionStore(selectCurrentProblem);
  const initialized = useProblemSessionStore(selectInitialized);
  const group = useProblemSessionStore(selectGroup);
  const childIndex = useProblemSessionStore(selectChildIndex);
  const publishId = useProblemSessionStore(selectPublishId);
  const publishAt = useProblemSessionStore(selectPublishAt);
  const problemSetTitle = useProblemSessionStore(selectProblemSetTitle);
  const finishMain = useProblemSessionStore((state) => state.finishMain);
  const finishMainRetry = useProblemSessionStore((state) => state.finishMainRetry);
  const finishChildProblem = useProblemSessionStore((state) => state.finishChildProblem);
  const resetSession = useProblemSessionStore((state) => state.reset);
  const { invalidateStudyData } = useInvalidateStudyData();
  const toggleScrapMutation = useToggleScrapFromProblem();
  const { data: scrapStatusData } = useGetScrapStatusById(
    currentProblem?.id ?? 0,
    !!currentProblem?.id
  );

  // Scrap animation interpolations
  const scrapBgColor = scrapAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors['gray-200'], colors['gray-400']],
  });
  const scrapIconColor = scrapAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors['gray-700'], colors['primary-500']],
  });

  const problemSubtitle = useMemo(() => {
    if (!group) {
      return '';
    }
    if (
      phase === 'MAIN_PROBLEM' ||
      phase === 'MAIN_PROBLEM_RETRY' ||
      phase === 'MAIN_POINTINGS' ||
      phase === 'ANALYSIS'
    ) {
      return `문제 ${group.no}번`;
    }
    if (phase === 'CHILD_PROBLEM' || phase === 'CHILD_POINTINGS') {
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
    if (!group || !currentProblem) {
      redirectToHome();
    }
  }, [initialized, group, currentProblem, redirectToHome]);

  useEffect(() => {
    setAnswer('');
    setIsAnswerCorrect(false);
    setIsSubmitting(false);
    setKeyboardVisible(false);
    setResultSheetVisible(false);
    if (keyboardSheetIndex.value > -1) {
      bottomSheetRef.current?.close();
    }
    if (resultSheetIndex.value > -1) {
      resultSheetRef.current?.close();
    }
    const isMainPhase = phase === 'MAIN_PROBLEM' || phase === 'MAIN_PROBLEM_RETRY';
    const initialAttempts = isMainPhase
      ? (group?.attemptCount ?? currentProblem?.attemptCount ?? 0)
      : (currentProblem?.attemptCount ?? 0);
    setLastAttemptCount(initialAttempts);
  }, [currentProblem?.id]);

  // Sync scrap state with fetched data
  useEffect(() => {
    const isProblemScrapped = scrapStatusData?.isProblemScrapped ?? false;
    setIsScraped(isProblemScrapped);
    scrapAnimValue.setValue(isProblemScrapped ? 1 : 0);
  }, [scrapStatusData?.isProblemScrapped, scrapAnimValue]);

  useEffect(() => {
    setProblemProgress(currentProblem?.progress ?? null);
  }, [currentProblem?.id, currentProblem?.progress]);

  useAnimatedReaction(
    () => keyboardSheetIndex.value,
    (current, previous) => {
      const isOpen = current >= -0.5;
      const wasOpen = (previous ?? -1) >= -0.5;
      if (isOpen !== wasOpen) {
        runOnJS(setKeyboardVisible)(isOpen);
      }
    }
  );

  useEffect(() => {
    Animated.timing(actionBarFade, {
      toValue: isKeyboardVisible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isKeyboardVisible, actionBarFade]);

  useAnimatedReaction(
    () => resultSheetIndex.value,
    (current, previous) => {
      const isOpen = current >= 0;
      const wasOpen = (previous ?? -1) >= 0;
      if (isOpen !== wasOpen) {
        runOnJS(setResultSheetVisible)(isOpen);
      }
    }
  );

  const handleBottomBarLayout = useCallback((event: LayoutChangeEvent) => {
    setBottomBarHeight(event.nativeEvent.layout.height);
  }, []);

  const openKeyboard = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const closeKeyboard = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const openResultSheet = useCallback(() => {
    resultSheetRef.current?.expand();
  }, []);

  const closeResultSheet = useCallback(() => {
    resultSheetRef.current?.close();
  }, []);

  const toggleKeyboard = useCallback(() => {
    if (isResultSheetVisible) {
      return;
    }
    if (isKeyboardVisible) {
      closeKeyboard();
    } else {
      openKeyboard();
    }
  }, [closeKeyboard, openKeyboard, isKeyboardVisible, isResultSheetVisible]);

  const handleSubmitAnswer = useCallback(async () => {
    if (isSubmitting) {
      return;
    }
    if (!answer) {
      Alert.alert('답을 입력해주세요.');
      return;
    }
    if (!publishId || !currentProblem?.id) {
      Alert.alert('문제를 불러올 수 없어요.');
      return;
    }

    const numericAnswer = Number(answer);
    if (Number.isNaN(numericAnswer)) {
      Alert.alert('답안을 확인해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await postAnswer(publishId, currentProblem.id, numericAnswer);
      if (!response?.data) {
        throw new Error('Missing submission response');
      }

      const { isCorrect, attemptCount } = response.data;
      setIsAnswerCorrect(isCorrect);
      setProblemProgress(isCorrect ? 'CORRECT' : 'INCORRECT');
      setLastAttemptCount(attemptCount ?? 1);
      closeKeyboard();
      openResultSheet();
    } catch (error) {
      console.error('Failed to submit answer', error);
      Alert.alert('답안을 제출할 수 없어요.', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answer, closeKeyboard, currentProblem?.id, isSubmitting, openResultSheet, publishId]);

  const handleIDontKnow = useCallback(async () => {
    if (isSubmitting) {
      return;
    }
    if (!publishId || !currentProblem?.id) {
      Alert.alert('문제를 불러올 수 없어요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await postAnswer(publishId, currentProblem.id, null);
      if (!response?.data) {
        throw new Error('Missing submission response');
      }

      const { isCorrect, attemptCount } = response.data;
      setIsAnswerCorrect(isCorrect);
      setProblemProgress(isCorrect ? 'CORRECT' : 'INCORRECT');
      setLastAttemptCount(attemptCount ?? 1);
      setAnswer('');
      closeKeyboard();
      openResultSheet();
    } catch (error) {
      console.error('Failed to submit answer', error);
      Alert.alert('답안을 제출할 수 없어요.', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [closeKeyboard, currentProblem?.id, isSubmitting, openResultSheet, publishId]);

  const handleDeleteDigit = useCallback(() => {
    setAnswer((prev) => prev.slice(0, -1));
  }, []);

  const handleSelectChoice = useCallback((choice: string) => {
    setAnswer(choice);
  }, []);

  const proceedToNextStep = useCallback(() => {
    closeResultSheet();
    if (phase === 'MAIN_PROBLEM') {
      finishMain(isAnswerCorrect);
    } else if (phase === 'MAIN_PROBLEM_RETRY') {
      finishMainRetry();
    } else if (phase === 'CHILD_PROBLEM') {
      finishChildProblem();
    }

    const nextPhase = useProblemSessionStore.getState().phase;
    if (nextPhase === 'CHILD_POINTINGS' || nextPhase === 'MAIN_POINTINGS') {
      navigation?.navigate('Pointing');
    } else if (nextPhase === 'ANALYSIS') {
      navigation?.navigate('Analysis');
    }
  }, [
    closeResultSheet,
    finishChildProblem,
    finishMain,
    finishMainRetry,
    isAnswerCorrect,
    navigation,
    phase,
  ]);

  const handleCloseFlow = useCallback(() => {
    goHome();
  }, [goHome]);

  const primaryButtonLabel = useMemo(() => {
    if (!group) {
      return '계속';
    }
    const childProblems = group.childProblems ?? [];
    const mainPointingsCount = group.problem.pointings?.length ?? 0;
    const hasChildPointingsAhead = childProblems.some(
      (child) => (child.pointings?.length ?? 0) > 0
    );

    if (phase === 'MAIN_PROBLEM') {
      if (isAnswerCorrect) {
        return hasChildPointingsAhead || mainPointingsCount > 0 ? '포인팅 학습하기' : '해설 보기';
      }
      if (childProblems.length > 0) {
        return '다음 문제';
      }
      return mainPointingsCount > 0 ? '포인팅 학습하기' : '해설 보기';
    }

    if (phase === 'MAIN_PROBLEM_RETRY') {
      return mainPointingsCount > 0 ? '포인팅 학습하기' : '해설 보기';
    }

    if (phase === 'CHILD_PROBLEM') {
      const child = childIndex >= 0 ? childProblems[childIndex] : undefined;
      const childPointingsCount = child?.pointings?.length ?? 0;
      if (childPointingsCount > 0) {
        return '포인팅 학습하기';
      }
      const nextChildExists = childIndex + 1 < childProblems.length;
      if (nextChildExists) {
        return '다음 문제';
      }
      return '메인 문제 풀기';
    }

    return '계속';
  }, [childIndex, group, isAnswerCorrect, phase]);

  const showRetryButton = useMemo(
    () =>
      phase !== 'MAIN_PROBLEM_RETRY' && !isAnswerCorrect && lastAttemptCount < MAX_RETRY_ATTEMPTS,
    [phase, lastAttemptCount, isAnswerCorrect]
  );

  const handleRetry = useCallback(() => {
    resultSheetRef.current?.close();
    setAnswer('');
  }, []);

  const handleToggleScrap = useCallback(() => {
    if (!currentProblem?.id || toggleScrapMutation.isPending) {
      return;
    }

    // Optimistic update with animation - trust the toggle, only revert on error
    const previousState = isScraped;
    const newScrapState = !previousState;
    setIsScraped(newScrapState);
    Animated.spring(scrapAnimValue, {
      toValue: newScrapState ? 1 : 0,
      useNativeDriver: false,
      tension: 200,
      friction: 20,
    }).start();

    toggleScrapMutation.mutate(
      { problemId: currentProblem.id },
      {
        onError: () => {
          // Revert to previous state on error
          setIsScraped(previousState);
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
  }, [currentProblem?.id, isScraped, scrapAnimValue, toggleScrapMutation]);

  const problemInitMessage = useMemo(
    () =>
      buildDocumentInit({
        content: currentProblem?.problemContent ?? '',
        fontStyle: 'serif',
      }),
    [currentProblem?.problemContent]
  );

  const badgeStatus = useMemo(() => {
    const progress = problemProgress ?? currentProblem?.progress;
    if (progress === 'CORRECT') return 'correct' as const;
    if (progress === 'INCORRECT') return 'incorrect' as const;
    return;
  }, [problemProgress, currentProblem?.progress]);

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [undoState, setUndoState] = useState({ canUndo: false, canRedo: false });
  const drawingState = useDrawingState();

  const screenHeight = Dimensions.get('window').height;

  return (
    <View className='flex-1 bg-white'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <Header
          title={problemSetTitle}
          subtitle={problemSubtitle}
          badge={badgeStatus}
          right={<Header.IconButton icon={XIcon} onPress={() => setIsCloseVisible(true)} />}
        />

        <View
          style={{
            position: 'absolute',
            left: 16,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            zIndex: 100,
          }}
          pointerEvents='box-none'>
          <View pointerEvents='auto'>
            <ProblemDrawingToolbar
              isEraserMode={drawingState.isEraserMode}
              onPenModePress={drawingState.setPenMode}
              onEraserModePress={() => {
                if (drawingState.isEraserMode) {
                  drawingState.setPenMode();
                } else {
                  drawingState.setEraserMode();
                }
              }}
              canUndo={undoState.canUndo}
              canRedo={undoState.canRedo}
              onUndo={() => canvasRef.current?.undo()}
              onRedo={() => canvasRef.current?.redo()}
            />
          </View>
        </View>

        <ContentInset className='flex-1'>
          <DrawingCanvas
            ref={canvasRef}
            strokeColor='#1E1E21'
            strokeWidth={2}
            activeTool={drawingState.mode}
            eraserSize={12}
            pencilOnly
            enableZoomPan
            onUndoStateChange={setUndoState}
            backgroundColor='transparent'
            // NOTE: 현재 문제 콘텐츠가 screenHeight*2를 초과하는 케이스는 없음.
            // 만약 초과할 경우 PointerContentView 높이 측정 후 동적 설정 필요.
            minCanvasHeight={screenHeight * 2}>
            <PointerContentView
              initMessage={problemInitMessage}
              minHeight={200}
              style={{ maxWidth: 720 }}
            />
          </DrawingCanvas>
        </ContentInset>
        <AnswerKeyboardSheet
          ref={bottomSheetRef}
          bottomInset={bottomBarHeight}
          value={answer}
          answerType={currentProblem?.answerType}
          animatedIndex={keyboardSheetIndex}
          onAppendDigit={(digit) => setAnswer((prev) => prev + digit)}
          onSelectChoice={handleSelectChoice}
          onDelete={handleDeleteDigit}
        />
        <BottomActionBar bottomInset={insets.bottom} onLayout={handleBottomBarLayout}>
          <View style={actionBarStyles.container}>
            <Animated.View
              style={[
                actionBarStyles.layer,
                {
                  opacity: actionBarFade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ]}
              pointerEvents={isKeyboardVisible ? 'none' : 'auto'}>
              <BottomActionBar.Button
                animatedStyle={{ backgroundColor: scrapBgColor }}
                onPress={handleToggleScrap}>
                <BookmarkIcon
                  size={22}
                  color={isScraped ? colors['primary-500'] : colors['gray-700']}
                  fill={isScraped ? colors['primary-500'] : 'transparent'}
                />
              </BottomActionBar.Button>
              <BottomActionBar.Button
                className='bg-primary-600'
                containerStyle={{ flex: 1 }}
                onPress={toggleKeyboard}>
                <Text className='typo-body-1-medium text-white'>답 입력하기</Text>
              </BottomActionBar.Button>
            </Animated.View>
            <Animated.View
              style={[actionBarStyles.layer, actionBarStyles.overlay, { opacity: actionBarFade }]}
              pointerEvents={isKeyboardVisible ? 'auto' : 'none'}>
              <BottomActionBar.Button
                className='border border-gray-500 bg-gray-100'
                containerStyle={{ flex: 1 }}
                onPress={handleIDontKnow}>
                <Text className='typo-body-1-medium text-black'>잘 모르겠어요</Text>
              </BottomActionBar.Button>
              <BottomActionBar.Button
                className={!answer || isSubmitting ? 'bg-primary-300' : 'bg-primary-600'}
                containerStyle={{ flex: 2 }}
                disabled={!answer || isSubmitting}
                onPress={handleSubmitAnswer}>
                <Text className='typo-body-1-medium text-white'>
                  {isSubmitting ? '제출 중...' : '제출하기'}
                </Text>
              </BottomActionBar.Button>
            </Animated.View>
          </View>
        </BottomActionBar>
      </SafeAreaView>
      <View pointerEvents='box-none' style={StyleSheet.absoluteFill}>
        <ResultSheet
          ref={resultSheetRef}
          bottomInset={0}
          isCorrect={isAnswerCorrect}
          primaryButtonLabel={primaryButtonLabel}
          secondaryButtonLabel={showRetryButton ? '다시 풀어보기' : undefined}
          onPressSecondary={showRetryButton ? handleRetry : undefined}
          onPressPrimary={proceedToNextStep}
          animatedIndex={resultSheetIndex}
        />
      </View>
      <ConfirmationModal
        visible={isCloseVisible}
        onClose={() => setIsCloseVisible(false)}
        title='문제 풀이 화면을 나갈까요?'
        description={`풀이 과정이 저장되지 않습니다.`}
        buttons={[
          { label: '나가기', onPress: () => handleCloseFlow(), variant: 'default' },
          { label: '계속 풀기', onPress: () => setIsCloseVisible(false), variant: 'primary' },
        ]}
      />
    </View>
  );
};

const actionBarStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ProblemScreen;
