import { useCallback } from 'react';
import { View } from 'react-native';

import { gradeOptions } from '../../constants';
import { OnboardingLayout, OptionButton } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

const GradeStep = ({ navigation }: OnboardingScreenProps<'Grade'>) => {
  const grade = useOnboardingStore((state) => state.grade);
  const setGrade = useOnboardingStore((state) => state.setGrade);
  const setSelectSubject = useOnboardingStore((state) => state.setSelectSubject);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  const handleNext = useCallback(() => {
    if (!grade) return;

    if (grade === 'ONE' || grade === 'TWO') {
      setSelectSubject(null);
      setCurrentStep('School');
      navigation.navigate('School');
    } else {
      setCurrentStep('MathSubject');
      navigation.navigate('MathSubject');
    }
  }, [grade, navigation, setSelectSubject]);

  return (
    <OnboardingLayout
      title='고등학교 학년을 선택해 주세요.'
      description='학년을 입력해 교육과정이 고려된 맞춤형 문제를 제공받아요.'
      onPressCTA={handleNext}
      ctaDisabled={!grade}
      showBackButton={false}>
      <View className='gap-[20px]'>
        {gradeOptions.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={grade === option.value}
            onPress={() => setGrade(option.value)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
};

export default GradeStep;
