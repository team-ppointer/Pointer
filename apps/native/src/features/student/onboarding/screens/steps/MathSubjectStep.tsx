import { useCallback } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { mathSubjectOptions } from '../../constants';
import { OnboardingLayout, OptionButton } from '../../components';
import useFinishOnboarding from '../../hooks/useFinishOnboarding';
import useResolveCurrentMockExamType from '../../hooks/useResolveCurrentMockExamType';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { getOnboardingTotal } from '../../utils';
import type { OnboardingScreenProps } from '../types';

const MathSubjectStep = ({ navigation }: OnboardingScreenProps<'MathSubject'>) => {
  const grade = useOnboardingStore((state) => state.grade);
  const selectSubject = useOnboardingStore((state) => state.selectSubject);
  const setSelectSubject = useOnboardingStore((state) => state.setSelectSubject);
  const setSchoolId = useOnboardingStore((state) => state.setSchoolId);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const currentMockExamType = useOnboardingStore((state) => state.currentMockExamType);
  const currentTypeStatus = useOnboardingStore((state) => state.currentTypeStatus);

  useFocusEffect(
    useCallback(() => {
      setCurrentStep('MathSubject');
    }, [setCurrentStep])
  );

  const { submit, isPending } = useFinishOnboarding();
  const { resolveCurrentMockExamType, isResolvingCurrentType } = useResolveCurrentMockExamType();

  const isNTime = grade === 'N_TIME';
  const isCurrentTypeReady = currentTypeStatus === 'resolved';
  const isCurrentTypeRetryable = currentTypeStatus === 'error';
  const isCurrentTypeBlocked = currentTypeStatus !== 'resolved' && currentTypeStatus !== 'error';
  const hasActiveMockExam = isCurrentTypeReady && Boolean(currentMockExamType?.type);
  const isProcessing = isPending || isResolvingCurrentType;
  const ctaDisabled = !selectSubject || (isNTime && (isProcessing || isCurrentTypeBlocked));

  const handleNext = useCallback(async () => {
    if (!selectSubject) return;

    if (isNTime) {
      let nextMockExamType = currentMockExamType;

      if (isCurrentTypeRetryable) {
        const result = await resolveCurrentMockExamType();
        if (!result.ok) return;
        nextMockExamType = result.currentMockExamType;
      } else if (!isCurrentTypeReady) {
        return;
      }

      setSchoolId(null);
      if (nextMockExamType?.type) {
        setCurrentStep('MockExam');
        navigation.navigate('MockExam');
        return;
      }
      await submit();
      return;
    }

    setCurrentStep('School');
    navigation.navigate('School');
  }, [
    isNTime,
    selectSubject,
    navigation,
    setSchoolId,
    setCurrentStep,
    isCurrentTypeReady,
    isCurrentTypeRetryable,
    currentMockExamType,
    resolveCurrentMockExamType,
    submit,
  ]);

  const total = getOnboardingTotal(grade, hasActiveMockExam);

  return (
    <OnboardingLayout
      title='수능 수학 선택과목을 1개 선택해 주세요.'
      description='2026년 11월 19일에 예정된 수능에서 응시할 선택과목을 선택해 주세요.'
      onPressCTA={handleNext}
      ctaDisabled={ctaDisabled}
      ctaLoading={isNTime && isProcessing}
      progress={{ current: 2, total }}>
      <View className='gap-[20px]'>
        {mathSubjectOptions.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={selectSubject === option.value}
            onPress={() => setSelectSubject(option.value)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
};

export default MathSubjectStep;
