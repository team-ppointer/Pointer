import { colors } from '@/theme/tokens';
import { postAnswer, useGetScrapStatusById, useToggleScrapFromProblem } from '@apis/student';
import { Container } from '@components/common';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import { BookmarkIcon, MessageCircleMoreIcon } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomActionBar from '../components/BottomActionBar';
import Header from '../components/Header';
import AnswerKeyboardSheet from '../components/AnswerKeyboardSheet';
import ResultSheet from '../components/ResultSheet';
import type { StudentRootStackParamList } from '@navigation/student/types';
import { useInvalidateStudyData } from '@hooks';
import { components } from '@schema';
import {
  selectChildIndex,
  selectCurrentProblem,
  selectGroup,
  selectInitialized,
  selectPhase,
  selectPublishAt,
  selectPublishId,
  useProblemSessionStore,
} from '@stores/problemSessionStore';
import { formatPublishDateLabel } from '../utils/formatters';
import ProblemViewer from '../components/ProblemViewer';

type ProblemScreenProps = Partial<NativeStackScreenProps<StudentRootStackParamList, 'Problem'>>;

type ProblemProgress = components['schemas']['ProblemWithStudyInfoResp']['progress'];

const ProblemScreen = ({ navigation }: ProblemScreenProps) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const resultSheetRef = useRef<BottomSheet>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [answer, setAnswer] = useState('');
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const [isResultSheetVisible, setResultSheetVisible] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incorrectAttemptCount, setIncorrectAttemptCount] = useState(0);
  const [problemProgress, setProblemProgress] = useState<ProblemProgress | null>(null);
  const [isScraped, setIsScraped] = useState(false);
  const scrapAnimValue = useRef(new Animated.Value(0)).current;

  const phase = useProblemSessionStore(selectPhase);
  const currentProblem = useProblemSessionStore(selectCurrentProblem);
  const initialized = useProblemSessionStore(selectInitialized);
  const group = useProblemSessionStore(selectGroup);
  const childIndex = useProblemSessionStore(selectChildIndex);
  const publishId = useProblemSessionStore(selectPublishId);
  const publishAt = useProblemSessionStore(selectPublishAt);
  const finishMain = useProblemSessionStore((state) => state.finishMain);
  const finishChildProblem = useProblemSessionStore((state) => state.finishChildProblem);
  const resetSession = useProblemSessionStore((state) => state.reset);
  const { invalidateStudyData } = useInvalidateStudyData();
  const toggleScrapMutation = useToggleScrapFromProblem();
  const { data: scrapStatusData } = useGetScrapStatusById(
    currentProblem?.id ?? 0,
    !!currentProblem?.id
  );

  const publishDateLabel = useMemo(() => formatPublishDateLabel(publishAt), [publishAt]);

  // Scrap animation interpolations
  const scrapBgColor = scrapAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors['gray-200'], colors['gray-400']],
  });
  const scrapIconColor = scrapAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors['gray-700'], colors['primary-500']],
  });

  const problemTitle = useMemo(() => {
    if (!group) {
      return '';
    }
    if (phase === 'MAIN_PROBLEM' || phase === 'MAIN_POINTINGS' || phase === 'ANALYSIS') {
      return `실전문제 ${group.no}번`;
    }
    if (phase === 'CHILD_PROBLEM' || phase === 'CHILD_POINTINGS') {
      const order = childIndex >= 0 ? childIndex + 1 : 0;
      return order > 0 ? `연습문제 ${order}번` : '연습문제';
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
    setKeyboardVisible(false);
    setResultSheetVisible(false);
    setIsAnswerCorrect(false);
    setIsSubmitting(false);
    bottomSheetRef.current?.close();
    resultSheetRef.current?.close();
    setIncorrectAttemptCount(0);
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

  const handleBottomBarLayout = useCallback((event: LayoutChangeEvent) => {
    setBottomBarHeight(event.nativeEvent.layout.height);
  }, []);

  const openKeyboard = useCallback(() => {
    setKeyboardVisible(true);
    bottomSheetRef.current?.expand();
  }, []);

  const closeKeyboard = useCallback(() => {
    setKeyboardVisible(false);
    bottomSheetRef.current?.close();
  }, []);

  const openResultSheet = useCallback(() => {
    resultSheetRef.current?.expand();
  }, []);

  const closeResultSheet = useCallback(() => {
    setResultSheetVisible(false);
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

      const { isCorrect } = response.data;
      setIsAnswerCorrect(isCorrect);
      setProblemProgress(isCorrect ? 'CORRECT' : 'INCORRECT');
      setIncorrectAttemptCount((prev) => (isCorrect ? 0 : prev + 1));
      closeKeyboard();
      openResultSheet();
    } catch (error) {
      console.error('Failed to submit answer', error);
      Alert.alert('답안을 제출할 수 없어요.', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answer, closeKeyboard, currentProblem?.id, isSubmitting, openResultSheet, publishId]);

  const handleIDontKnow = useCallback(() => {
    setAnswer('');
    closeKeyboard();
  }, [closeKeyboard]);

  const handleDeleteDigit = useCallback(() => {
    setAnswer((prev) => prev.slice(0, -1));
  }, []);

  const handleSelectChoice = useCallback((choice: string) => {
    setAnswer(choice);
  }, []);

  const handleSheetVisibility = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setKeyboardVisible(false);
    }
  }, []);

  const handleSheetAnimate = useCallback((fromIndex: number, toIndex: number) => {
    setKeyboardVisible(toIndex >= 0);
  }, []);

  const handleResultSheetVisibility = useCallback((isOpen: boolean) => {
    setResultSheetVisible(isOpen);
  }, []);

  const handleResultSheetAnimate = useCallback((fromIndex: number, toIndex: number) => {
    setResultSheetVisible(toIndex >= 0);
  }, []);

  const proceedToNextStep = useCallback(() => {
    closeResultSheet();
    if (phase === 'MAIN_PROBLEM') {
      finishMain(isAnswerCorrect);
    } else if (phase === 'CHILD_PROBLEM') {
      finishChildProblem();
    }

    const nextPhase = useProblemSessionStore.getState().phase;
    if (nextPhase === 'CHILD_POINTINGS' || nextPhase === 'MAIN_POINTINGS') {
      navigation?.navigate('Pointing');
    } else if (nextPhase === 'ANALYSIS') {
      navigation?.navigate('Analysis');
    }
  }, [closeResultSheet, finishChildProblem, finishMain, isAnswerCorrect, navigation, phase]);

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
      return mainPointingsCount > 0 ? '포인팅 학습하기' : '해설 보기';
    }

    return '계속';
  }, [childIndex, group, isAnswerCorrect, phase]);

  const showRetryButton = useMemo(
    () => !isAnswerCorrect && incorrectAttemptCount === 1,
    [incorrectAttemptCount, isAnswerCorrect]
  );

  const handleRetry = useCallback(() => {
    resultSheetRef.current?.close();
    setResultSheetVisible(false);
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

  const subtitle = publishDateLabel ?? '';

  return (
    <View className='flex-1'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <Header onClose={handleCloseFlow}>
          {subtitle ? <Header.Subtitle>{subtitle}</Header.Subtitle> : null}
          <Header.TitleGroup>
            <Header.Title>{problemTitle}</Header.Title>
            <Header.Status status={problemProgress ?? currentProblem?.progress} />
          </Header.TitleGroup>
        </Header>

        <ScrollView>
          <Container className='flex-1'>
            {/* Problem */}
            <View className='my-[10px] overflow-hidden rounded-[8px] bg-white'>
              <ProblemViewer
                problemContent={currentProblem?.problemContent ?? ''}
                minHeight={200}
                padding={20}
              />
            </View>

            {/* Writing Area */}
            {/* <WritingArea /> */}
          </Container>
        </ScrollView>
        <AnswerKeyboardSheet
          ref={bottomSheetRef}
          bottomInset={bottomBarHeight}
          value={answer}
          answerType={currentProblem?.answerType}
          onAppendDigit={(digit) => setAnswer((prev) => prev + digit)}
          onSelectChoice={handleSelectChoice}
          onDelete={handleDeleteDigit}
          onSubmit={handleSubmitAnswer}
          onClose={closeKeyboard}
          onSheetChange={handleSheetVisibility}
          onSheetAnimate={handleSheetAnimate}
        />
        <BottomActionBar bottomInset={insets.bottom} onLayout={handleBottomBarLayout}>
          {isKeyboardVisible ? (
            <>
              <BottomActionBar.Button
                className='bg-primary-200 h-[42px]'
                containerStyle={{ flex: 1 }}
                onPress={handleIDontKnow}>
                <Text className='text-14m text-black'>잘 모르겠어요</Text>
              </BottomActionBar.Button>
              <BottomActionBar.Button
                className={`bg-primary-500 h-[42px] ${isSubmitting ? 'opacity-60' : ''}`}
                containerStyle={{ flex: 1 }}
                disabled={isSubmitting}
                onPress={handleSubmitAnswer}>
                <Text className='text-16m text-white'>
                  {isSubmitting ? '제출 중...' : '제출하기'}
                </Text>
              </BottomActionBar.Button>
            </>
          ) : (
            <>
              <BottomActionBar.Button
                animatedStyle={{ backgroundColor: scrapBgColor }}
                onPress={handleToggleScrap}>
                <BookmarkIcon
                  size={22}
                  color={isScraped ? colors['primary-500'] : colors['gray-700']}
                  fill={isScraped ? colors['primary-500'] : 'transparent'}
                />
              </BottomActionBar.Button>
              {/* <BottomActionBar.Button className='bg-gray-200' onPress={() => {}}>
                <MessageCircleMoreIcon size={22} color={colors['gray-700']} />
              </BottomActionBar.Button> */}
              <BottomActionBar.Button
                className='bg-primary-500 h-[42px]'
                containerStyle={{ flex: 1 }}
                onPress={toggleKeyboard}>
                <Text className='text-16m text-white'>답 입력하기</Text>
              </BottomActionBar.Button>
            </>
          )}
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
          onSheetChange={handleResultSheetVisibility}
          onSheetAnimate={handleResultSheetAnimate}
        />
      </View>
    </View>
  );
};

export default ProblemScreen;
