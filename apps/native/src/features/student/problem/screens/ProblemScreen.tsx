import { colors } from '@/theme/tokens';
import { Container } from '@components/common';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import { BookmarkIcon, MessageCircleMoreIcon } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import AnswerKeyboardSheet from '../components/AnswerKeyboardSheet';

import type { StudentRootStackParamList } from '@navigation/student/types';
import WritingArea from '../components/WritingArea';

type ProblemScreenProps = Partial<NativeStackScreenProps<StudentRootStackParamList, 'Problem'>>;

const ProblemScreen = ({ navigation }: ProblemScreenProps) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [answer, setAnswer] = useState('');
  const [bottomBarHeight, setBottomBarHeight] = useState(0);

  const handleBottomBarLayout = useCallback((event: LayoutChangeEvent) => {
    setBottomBarHeight(event.nativeEvent.layout.height);
  }, []);

  const openKeyboard = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const closeKeyboard = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const toggleKeyboard = useCallback(() => {
    if (isKeyboardVisible) {
      closeKeyboard();
    } else {
      openKeyboard();
    }
  }, [closeKeyboard, openKeyboard, isKeyboardVisible]);

  const handleSubmitAnswer = useCallback(() => {
    closeKeyboard();
  }, [closeKeyboard]);

  const handleIDontKnow = useCallback(() => {
    setAnswer('');
    closeKeyboard();
  }, [closeKeyboard]);

  const handleDeleteDigit = useCallback(() => {
    setAnswer((prev) => prev.slice(0, -1));
  }, []);

  const handleSheetVisibility = useCallback((isOpen: boolean) => {
    setKeyboardVisible(isOpen);
  }, []);

  const handleCloseKeyboard = useCallback(() => {
    setKeyboardVisible(false);
  }, []);

  return (
    <SafeAreaView className='flex-1' edges={['top']}>
      <Container className='flex-1'>
        <Header navigation={navigation} />

        {/* Problem */}
        <View className='my-[10px] min-h-[200px] rounded-[8px] bg-white p-[20px]'>
          <Text className='text-13r text-gray-900'>문제 내용</Text>
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
      />
      <View
        className='border-t border-gray-300 bg-white pt-[10px]'
        style={{ paddingBottom: 10 + insets.bottom }}
        onLayout={handleBottomBarLayout}>
        <Container className='flex-row items-center gap-[10px]'>
          {isKeyboardVisible ? (
            <>
              <Pressable
                className='h-[42px] max-w-[220px] flex-1 items-center justify-center rounded-[8px] border border-gray-500 bg-gray-100 px-[18px] py-[10px]'
                onPress={handleIDontKnow}>
                <Text className='text-14m text-gray-900'>잘 모르겠어요</Text>
              </Pressable>
              <Pressable
                className='bg-primary-500 h-[42px] flex-1 items-center justify-center rounded-[8px] px-[18px]'
                onPress={handleSubmitAnswer}>
                <Text className='text-16m text-white'>제출하기</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                className='items-center justify-center rounded-[8px] bg-gray-200 px-[18px] py-[10px]'
                onPress={() => {}}>
                <BookmarkIcon size={22} color={colors['gray-700']} />
              </Pressable>
              <Pressable
                className='items-center justify-center rounded-[8px] bg-gray-200 px-[18px] py-[10px]'
                onPress={() => {}}>
                <MessageCircleMoreIcon size={22} color={colors['gray-700']} />
              </Pressable>
              <Pressable
                className='bg-primary-500 h-[42px] flex-1 items-center justify-center rounded-[8px] px-[18px]'
                onPress={toggleKeyboard}>
                <Text className='text-16m text-white'>답 입력하기</Text>
              </Pressable>
            </>
          )}
        </Container>
      </View>
    </SafeAreaView>
  );
};

export default ProblemScreen;
