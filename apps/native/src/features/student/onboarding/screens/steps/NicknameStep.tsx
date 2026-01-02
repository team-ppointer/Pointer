import { useState } from 'react';
import { OnboardingLayout, OnboardingInput } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

const nicknameRegex = /^[가-힣]{2,4}$/;

const NicknameStep = ({ navigation }: OnboardingScreenProps<'Nickname'>) => {
  const nickname = useOnboardingStore((state) => state.nickname);
  const setNickname = useOnboardingStore((state) => state.setNickname);

  const [value, setValue] = useState(nickname);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!nicknameRegex.test(value)) {
      setError('한글 2~4자로 입력해 주세요.');
      return;
    }
    setNickname(value);
    navigation.navigate('Welcome');
  };

  const handleSkip = () => {
    setNickname('');
    navigation.navigate('Welcome');
  };

  return (
    <OnboardingLayout
      title='닉네임을 입력해 주세요.'
      description='원활한 학습을 위해 본명 사용을 추천해요.'
      onPressCTA={handleNext}
      ctaDisabled={!value}
      skipLabel='건너뛰기'
      onSkip={handleSkip}>
      <OnboardingInput
        label='닉네임'
        placeholder='홍길동'
        value={value}
        onChangeText={(text) => {
          setValue(text);
          if (error) setError('');
        }}
        hint='한글만 작성 가능, 2-4글자'
        errorMessage={error || undefined}
      />
    </OnboardingLayout>
  );
};

export default NicknameStep;
