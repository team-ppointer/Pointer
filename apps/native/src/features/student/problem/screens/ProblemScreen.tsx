import { colors } from '@/theme/tokens';
import { Container } from '@components/common';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import { BookmarkIcon, MessageCircleMoreIcon } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import AnswerKeyboardSheet from '../components/AnswerKeyboardSheet';
import ResultSheet from '../components/ResultSheet';
import BottomActionBar from '../components/BottomActionBar';

import type { StudentRootStackParamList } from '@navigation/student/types';
import WritingArea from '../components/WritingArea';

type ProblemScreenProps = Partial<NativeStackScreenProps<StudentRootStackParamList, 'Problem'>>;

const ProblemScreen = ({ navigation }: ProblemScreenProps) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const resultSheetRef = useRef<BottomSheet>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [answer, setAnswer] = useState('');
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const [isResultSheetVisible, setResultSheetVisible] = useState(false);
  const [isAnswerCorrect] = useState(false);

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

  const handleSubmitAnswer = useCallback(() => {
    closeKeyboard();
    openResultSheet();
  }, [closeKeyboard, openResultSheet]);

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

  return (
    <View className='flex-1'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <Container className='flex-1'>
          <Header navigation={navigation} />

          {/* Problem */}
          <View className='my-[10px] min-h-[200px] rounded-[8px] bg-white p-[20px]'>
            <Text className='text-13r text-gray-900'>
              문제가 보여지는 영역입니다. 문제가 보여지는 영역입니다. 문제가 보여지는 영역입니다.
              문제가 보여지는 영역입니다. 문제가 보여지는 영역입니다. 문제가 보여지는 영역입니다.
              문제가 보여지는 영역입니다. 문제가 보여지는 영역입니다.{' '}
            </Text>
          </View>

          {/* Writing Area */}
          <WritingArea />
        </Container>
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
                className='bg-primary-500 h-[42px] flex-1'
                onPress={handleSubmitAnswer}>
                <Text className='text-16m text-white'>제출하기</Text>
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
          onSheetChange={handleResultSheetVisibility}
          onSheetAnimate={handleResultSheetAnimate}
          navigation={navigation}
        />
      </View>
    </View>
  );
};

export default ProblemScreen;
