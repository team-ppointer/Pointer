import { View } from 'react-native';
import { mathSubjectOptions } from '../../constants';
import { OnboardingLayout, OptionButton } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

const MathSubjectStep = ({ navigation }: OnboardingScreenProps<'MathSubject'>) => {
  const mathSubject = useOnboardingStore((state) => state.mathSubject);
  const setMathSubject = useOnboardingStore((state) => state.setMathSubject);

  return (
    <OnboardingLayout
      title='수능 수학 선택과목을 1개 선택해 주세요.'
      description='2026년 11월 19일에 예정된 수능에서 응시할 선택과목을 선택해 주세요.'
      onPressCTA={() => navigation.navigate('School')}
      ctaDisabled={!mathSubject}>
      <View className='gap-[20px]'>
        {mathSubjectOptions.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={mathSubject === option.value}
            onPress={() => setMathSubject(option.value)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
};

export default MathSubjectStep;
