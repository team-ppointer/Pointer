import { colors } from '@/theme/tokens';
import { postAnswer } from '@apis';
import { Container } from '@components/common';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import { BookmarkIcon, MessageCircleMoreIcon } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomActionBar from '../components/BottomActionBar';
import Header from '../components/Header';
import AnswerKeyboardSheet from '../components/AnswerKeyboardSheet';
import ResultSheet from '../components/ResultSheet';
import WritingArea from '../components/WritingArea';
import type { StudentRootStackParamList } from '@navigation/student/types';
import useInvalidateStudyData from '@hooks/useInvalidateStudyData';
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

  const publishDateLabel = useMemo(() => formatPublishDateLabel(publishAt), [publishAt]);

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
            <WritingArea />
          </Container>
        </ScrollView>
        <AnswerKeyboardSheet
          ref={bottomSheetRef}
          bottomInset={bottomBarHeight}
          value={answer}
          onAppendDigit={(digit) => setAnswer((prev) => prev + digit)}
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
                className='h-[42px] max-w-[220px] flex-1 border border-gray-500 bg-gray-100'
                onPress={handleIDontKnow}>
                <Text className='text-14m text-gray-900'>잘 모르겠어요</Text>
              </BottomActionBar.Button>
              <BottomActionBar.Button
                className={`bg-primary-500 h-[42px] flex-1 ${isSubmitting ? 'opacity-60' : ''}`}
                disabled={isSubmitting}
                onPress={handleSubmitAnswer}>
                <Text className='text-16m text-white'>
                  {isSubmitting ? '제출 중...' : '제출하기'}
                </Text>
              </BottomActionBar.Button>
            </>
          ) : (
            <>
              <BottomActionBar.Button className='bg-gray-200' onPress={() => {}}>
                <BookmarkIcon size={22} color={colors['gray-700']} />
              </BottomActionBar.Button>
              <BottomActionBar.Button className='bg-gray-200' onPress={() => {}}>
                <MessageCircleMoreIcon size={22} color={colors['gray-700']} />
              </BottomActionBar.Button>
              <BottomActionBar.Button
                className='bg-primary-500 h-[42px] flex-1'
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
