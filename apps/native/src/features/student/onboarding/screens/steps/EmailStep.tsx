import { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { OnboardingLayout, OnboardingInput } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';
import { useDebounce } from '@hooks';
import useGetEmailExists from '@apis/controller/student/auth/useGetEmailExists';
import { useAuthStore } from '@/stores';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailStep = ({ navigation }: OnboardingScreenProps<'Email'>) => {
  const storedEmail = useOnboardingStore((state) => state.email);
  const setEmail = useOnboardingStore((state) => state.setEmail);

  const [email, setEmailInput] = useState(storedEmail);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = emailRegex.test(email.toLowerCase());
  const debouncedEmail = useDebounce(email.trim().toLowerCase(), 300);

  const { data: emailExistsData, isFetching } = useGetEmailExists({
    email: debouncedEmail,
    enabled: isValidEmail && debouncedEmail.length > 0,
  });

  const emailExists = emailExistsData?.value ?? false;

  useEffect(() => {
    if (emailExists && !isFetching) {
      setError('이미 가입된 이메일입니다.');
    }
  }, [emailExists, isFetching]);

  const handleNext = () => {
    if (!isValidEmail) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    if (emailExists) {
      setError('이미 가입된 이메일입니다.');
      return;
    }

    setEmail(email);
    navigation.navigate('Identity');
  };

  const isNextDisabled = !email || isFetching || emailExists;

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
      <Button title='[DEBUG] LOGOUT' onPress={() => {
        useAuthStore.getState().signOut();
      }} />
    </OnboardingLayout>
  );
};

export default EmailStep;
