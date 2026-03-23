import { useCallback } from 'react';
import { View } from 'react-native';

import { mathSubjectOptions } from '../../constants';
import { OnboardingLayout, OptionButton } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

const MathSubjectStep = ({ navigation }: OnboardingScreenProps<'MathSubject'>) => {
  const grade = useOnboardingStore((state) => state.grade);
  const selectSubject = useOnboardingStore((state) => state.selectSubject);
  const setSelectSubject = useOnboardingStore((state) => state.setSelectSubject);
  const setSchoolId = useOnboardingStore((state) => state.setSchoolId);

  const handleNext = useCallback(() => {
    if (!selectSubject) return;

    if (grade === 'N_TIME') {
      setSchoolId(null);
      navigation.navigate('Score');
    } else {
      navigation.navigate('School');
    }
  }, [grade, selectSubject, navigation, setSchoolId]);

  return (
    <OnboardingLayout
      title='수능 수학 선택과목을 1개 선택해 주세요.'
      description='2026년 11월 19일에 예정된 수능에서 응시할 선택과목을 선택해 주세요.'
      onPressCTA={handleNext}
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
