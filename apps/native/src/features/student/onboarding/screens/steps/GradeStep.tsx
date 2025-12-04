import { View } from 'react-native';
import { gradeOptions } from '../../constants';
import { OnboardingLayout, OptionButton } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

const GradeStep = ({ navigation }: OnboardingScreenProps<'Grade'>) => {
  const grade = useOnboardingStore((state) => state.grade);
  const setGrade = useOnboardingStore((state) => state.setGrade);

  return (
    <OnboardingLayout
      title='고등학교 학년을 선택해 주세요.'
      description='학년을 입력해 교육과정이 고려된 맞춤형 문제를 제공받아요.'
      onPressCTA={() => navigation.navigate('MathSubject')}
      ctaDisabled={!grade}>
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
