import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getEmailExists } from '@apis/controller/student/auth/getEmailExists';
import { useDebounce } from '@hooks';
import { useAuthStore } from '@stores';
import { useSignupStore } from '@features/auth/signup/store/useSignupStore';
import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { OnboardingInput, OnboardingLayout } from '@features/student/onboarding/components';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = NativeStackScreenProps<AuthStackParamList, 'SignupEmail'>;

const SignupEmailScreen = ({ navigation }: Props) => {
  const setStoreEmail = useSignupStore((s) => s.setEmail);

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedEmail = useDebounce(email.trim().toLowerCase(), 300);
  const isValidEmail = EMAIL_REGEX.test(debouncedEmail);

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

      setStoreEmail(debouncedEmail);
      navigation.navigate('SignupTerms');
    } catch {
      setError('이메일 확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingLayout
      title='이메일 주소를 입력해 주세요.'
      onPressCTA={handleNext}
      ctaDisabled={!email || !isValidEmail || isLoading}
      onPressBack={async () => {
        await useAuthStore.getState().signOut();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }}>
      <OnboardingInput
        placeholder='pointer111@example.com'
        keyboardType='email-address'
        autoCapitalize='none'
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError(null);
        }}
        editable={!isLoading}
        errorMessage={error ?? undefined}
      />
    </OnboardingLayout>
  );
};

export default SignupEmailScreen;
