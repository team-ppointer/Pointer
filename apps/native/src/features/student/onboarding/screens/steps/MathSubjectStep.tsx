import { View } from 'react-native';
import { mathSubjectOptions } from '../../constants';
import { OnboardingLayout, OptionButton } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

const MathSubjectStep = ({ navigation }: OnboardingScreenProps<'MathSubject'>) => {
  const selectSubject = useOnboardingStore((state) => state.selectSubject);
  const setSelectSubject = useOnboardingStore((state) => state.setSelectSubject);

  return (
    <OnboardingLayout
      title='수능 수학 선택과목을 1개 선택해 주세요.'
      description='2026년 11월 19일에 예정된 수능에서 응시할 선택과목을 선택해 주세요.'
      onPressCTA={() => navigation.navigate('School')}
      ctaDisabled={!selectSubject}>
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
