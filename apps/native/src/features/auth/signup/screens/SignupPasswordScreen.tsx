import { useState, useCallback } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';

import { colors } from '@theme/tokens';
import { postEmailSignup } from '@apis/student';
import { setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';
import { useSignupStore } from '@features/auth/signup/store/useSignupStore';

import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { OnboardingInput, OnboardingLayout } from '@features/student/onboarding/components';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignupPassword'>;

const SignupPasswordScreen = ({ navigation, route }: Props) => {
  const { email } = route.params;

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setSessionStatus, setRole, updateStudentProfile } = useAuthStore();
  const startOnboarding = useOnboardingStore((s) => s.start);
  const signupStore = useSignupStore();

  const passwordsMatch = password === passwordConfirm;
  const isValid = password.length >= 8 && passwordsMatch && passwordConfirm.length > 0;

  const handleSignup = useCallback(async () => {
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await postEmailSignup({ email, password });

      if (!response.isSuccess || !response.data) {
        throw new Error('회원가입에 실패했습니다.');
      }

      await setAccessToken(response.data.token.accessToken);
      if (response.data.token.refreshToken) {
        await setRefreshToken(response.data.token.refreshToken);
      }

      if (response.data.name || response.data.grade) {
        await updateStudentProfile({
          name: response.data.name ?? null,
          grade: response.data.grade ?? null,
        });
      }

      // 이메일 가입 → STEP 1으로 진행 (약관 → 본인인증)
      signupStore.setEmail(email);
      startOnboarding();
      setRole('student');
      setSessionStatus('authenticated');

      // 약관동의 화면으로 이동
      navigation.navigate('SignupTerms');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [
    email,
    password,
    isValid,
    setSessionStatus,
    setRole,
    updateStudentProfile,
    startOnboarding,
    signupStore,
    navigation,
  ]);

  return (
    <OnboardingLayout
      title='비밀번호를 설정해주세요'
      description={email}
      onPressCTA={handleSignup}
      ctaDisabled={isLoading || !isValid}
      ctaLabel={isLoading ? '가입 중...' : '다음'}
      onPressBack={() => navigation.goBack()}>
      <View className='gap-[8px]'>
        <OnboardingInput
          placeholder='비밀번호 (8자 이상)'
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError(null);
          }}
          editable={!isLoading}
          errorMessage={error ?? undefined}
          rightAccessory={
            showPassword ? (
              <EyeOffIcon size={20} color={colors['gray-500']} />
            ) : (
              <EyeIcon size={20} color={colors['gray-500']} />
            )
          }
          onPressAccessory={() => setShowPassword(!showPassword)}
        />
        <OnboardingInput
          placeholder='비밀번호 확인'
          secureTextEntry={!showPassword}
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          editable={!isLoading}
          errorMessage={
            passwordConfirm && !passwordsMatch ? '비밀번호가 일치하지 않습니다.' : undefined
          }
        />
      </View>
    </OnboardingLayout>
  );
};

export default SignupPasswordScreen;
