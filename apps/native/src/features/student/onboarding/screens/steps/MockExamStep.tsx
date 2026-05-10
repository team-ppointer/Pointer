import { useCallback } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { OnboardingLayout } from '../../components';
import useFinishOnboarding from '../../hooks/useFinishOnboarding';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

const MockExamStep = (_props: OnboardingScreenProps<'MockExam'>) => {
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const incorrects = useOnboardingStore((state) => state.mockExamIncorrects);
  const question = useOnboardingStore((state) => state.mockExamQuestion);

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
      <View />
    </OnboardingLayout>
  );
};

export default MockExamStep;
