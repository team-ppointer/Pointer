import { useCallback, useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '@theme/tokens';

import { IncorrectGrid, OnboardingLayout } from '../../components';
import useFinishOnboarding from '../../hooks/useFinishOnboarding';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { getOnboardingTotal } from '../../utils';
import type { OnboardingScreenProps } from '../types';

const QUESTION_MAX_LENGTH = 1000;

const MockExamStep = (_props: OnboardingScreenProps<'MockExam'>) => {
  const grade = useOnboardingStore((state) => state.grade);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const incorrects = useOnboardingStore((state) => state.mockExamIncorrects);
  const toggleMockExamIncorrect = useOnboardingStore((state) => state.toggleMockExamIncorrect);
  const question = useOnboardingStore((state) => state.mockExamQuestion);
  const setMockExamQuestion = useOnboardingStore((state) => state.setMockExamQuestion);
  const currentMockExamType = useOnboardingStore((state) => state.currentMockExamType);

  const questionInputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      setCurrentStep('MockExam');
    }, [setCurrentStep])
  );

  const { submit, isPending } = useFinishOnboarding({ incorrects, question });

  const total = getOnboardingTotal(grade, currentMockExamType !== null);

  return (
    <OnboardingLayout
      title='6월 모의고사에서 틀린 문항 번호를 입력해 주세요'
      description='오답 문항과 수학 학습 고민을 입력해 개인별 약점 보완과 상담을 받아보세요'
      onPressCTA={() => {
        submit();
      }}
      ctaDisabled={isPending}
      progress={{ current: total, total }}>
      <View className='gap-[32px]'>
        <View className='md:mr-[148px]'>
          <Text className='typo-body-1-medium mb-[8px] ml-[4px] text-gray-900'>오답 문항</Text>
          <IncorrectGrid selected={incorrects} onToggle={toggleMockExamIncorrect} />
        </View>
        <View>
          <View className='mb-[8px] ml-[4px] flex-row'>
            <Text className='typo-body-1-medium text-gray-900'>수학 학습 고민 </Text>
            <Text className='typo-body-1-medium text-gray-600'>(선택)</Text>
          </View>
          <Pressable
            onPress={() => questionInputRef.current?.focus()}
            className='rounded-[10px] bg-white px-[16px] py-[11px]'
            style={{ borderColor: colors['gray-300'], borderWidth: 1 }}>
            <TextInput
              ref={questionInputRef}
              value={question}
              onChangeText={setMockExamQuestion}
              maxLength={QUESTION_MAX_LENGTH}
              multiline
              placeholder='평소 수학 공부를 하며 고민이었던 점을 자유롭게 남겨주세요.'
              placeholderTextColor={colors['gray-600']}
              style={{
                fontSize: 16,
                padding: 0,
                includeFontPadding: false,
                textAlignVertical: 'top',
                color: colors['gray-900'],
                minHeight: 200,
              }}
            />
          </Pressable>
          <View className='mt-[8px] flex-row justify-end'>
            <Text className='typo-label-regular text-gray-600'>
              {question.length}/{QUESTION_MAX_LENGTH}
            </Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
};

export default MockExamStep;
