import { useCallback } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '@theme/tokens';

import { IncorrectGrid, OnboardingLayout } from '../../components';
import useFinishOnboarding from '../../hooks/useFinishOnboarding';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

const QUESTION_MAX_LENGTH = 1000;

const MockExamStep = (_props: OnboardingScreenProps<'MockExam'>) => {
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const incorrects = useOnboardingStore((state) => state.mockExamIncorrects);
  const toggleMockExamIncorrect = useOnboardingStore((state) => state.toggleMockExamIncorrect);
  const question = useOnboardingStore((state) => state.mockExamQuestion);
  const setMockExamQuestion = useOnboardingStore((state) => state.setMockExamQuestion);

  useFocusEffect(
    useCallback(() => {
      setCurrentStep('MockExam');
    }, [setCurrentStep])
  );

  const { submit, isPending } = useFinishOnboarding({ incorrects, question });

  return (
    <OnboardingLayout
      title='6월 모의고사에서 틀린 문항 번호를 입력해 주세요'
      description='응시한 시험을 선택하고 오답 문항을 입력해 개인별 약점 보완과 상담을 받아보세요'
      onPressCTA={() => {
        submit();
      }}
      ctaDisabled={isPending}>
      <View className='gap-[24px]'>
        <IncorrectGrid selected={incorrects} onToggle={toggleMockExamIncorrect} />
        <View>
          <Text className='typo-label-medium mb-[6px] text-gray-900'>수학 학습 고민 (선택)</Text>
          <View
            className='rounded-[10px] bg-white px-[16px] py-[12px]'
            style={{ borderColor: colors['gray-300'], borderWidth: 1 }}>
            <TextInput
              value={question}
              onChangeText={setMockExamQuestion}
              maxLength={QUESTION_MAX_LENGTH}
              multiline
              placeholder='수학 학습에서의 고민을 자유롭게 입력해 주세요.'
              placeholderTextColor={colors['gray-600']}
              style={{
                minHeight: 120,
                textAlignVertical: 'top',
                color: '#000',
              }}
            />
            <View className='mt-[8px] flex-row justify-end'>
              <Text className='typo-caption-regular text-gray-600'>
                {question.length}/{QUESTION_MAX_LENGTH}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
};

export default MockExamStep;
