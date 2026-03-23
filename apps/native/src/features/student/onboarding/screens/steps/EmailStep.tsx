import { useState } from 'react';
import { Button } from 'react-native';
import { useDebounce } from '@hooks';
import { getEmailExists } from '@apis/controller/student/auth/getEmailExists';

import { OnboardingLayout, OnboardingInput } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

import { useAuthStore } from '@/stores';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailStep = ({ navigation }: OnboardingScreenProps<'Email'>) => {
  const storedEmail = useOnboardingStore((state) => state.email);
  const setEmail = useOnboardingStore((state) => state.setEmail);

  const [email, setEmailInput] = useState(storedEmail);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedEmail = useDebounce(email.trim().toLowerCase(), 300);
  const isValidEmail = emailRegex.test(debouncedEmail);

  const handleNext = async () => {
    if (!isValidEmail) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await getEmailExists(debouncedEmail);

      if (data?.value) {
        setError('이미 가입된 이메일입니다.');
        return;
      }

      setEmail(email);
      navigation.navigate('Identity');
    } catch {
      setError('이메일 확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const isNextDisabled = !email || !isValidEmail || isLoading;

  return (
    <OnboardingLayout
      title='이메일 주소를 입력해 주세요.'
      ctaDisabled={isNextDisabled}
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
      {/* <Button title='[DEBUG] LOGOUT' onPress={() => {
        useAuthStore.getState().signOut();
      }} /> */}
    </OnboardingLayout>
  );
};

export default EmailStep;
