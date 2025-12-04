import { useState } from 'react';
import { OnboardingLayout, OnboardingInput } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { duplicateEmailSamples } from '../../constants';
import type { OnboardingScreenProps } from '../types';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailStep = ({ navigation }: OnboardingScreenProps<'Email'>) => {
  const storedEmail = useOnboardingStore((state) => state.email);
  const setEmail = useOnboardingStore((state) => state.setEmail);

  const [email, setEmailInput] = useState(storedEmail);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (!emailRegex.test(email.toLowerCase())) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    if (duplicateEmailSamples.includes(email.toLowerCase())) {
      setError('이미 가입된 이메일입니다.');
      return;
    }

    setEmail(email);
    navigation.navigate('Identity');
  };

  return (
    <OnboardingLayout
      title='이메일 주소를 입력해 주세요.'
      ctaDisabled={!email}
      onPressCTA={handleNext}
      showBackButton={false}>
      <OnboardingInput
        label='이메일'
        value={email}
        onChangeText={(value) => {
          setEmailInput(value);
          if (error) setError(null);
        }}
        autoCapitalize='none'
        keyboardType='email-address'
        placeholder='pointer111@example.com'
        errorMessage={error ?? undefined}
      />
    </OnboardingLayout>
  );
};

export default EmailStep;
