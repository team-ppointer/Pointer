import { useState, useCallback } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';

import { AnimatedPressable } from '@components/common';
import { colors } from '@theme/tokens';
import { postLoginLocal } from '@apis/student';
import { setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';
import { useSignupStore } from '@features/auth/signup/store/useSignupStore';
import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { OnboardingLayout } from '@features/student/onboarding/components';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailLogin'>;

const EmailLoginScreen = ({ navigation, route }: Props) => {
  const { email } = route.params;

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setSessionStatus, setRole, updateStudentProfile } = useAuthStore();
  const startOnboarding = useOnboardingStore((s) => s.start);
  const completeOnboarding = useOnboardingStore((s) => s.complete);
  const signupStore = useSignupStore();

  const handleLogin = useCallback(async () => {
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await postLoginLocal({ email, password });

      if (apiError || !data) {
        throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }

      await setAccessToken(data.token.accessToken);
      if (data.token.refreshToken) {
        await setRefreshToken(data.token.refreshToken);
      }

      if (data.name || data.grade) {
        await updateStudentProfile({
          name: data.name ?? null,
          grade: data.grade ?? null,
        });
      }

      if (data.isFirstLogin) {
        // 기존 회원이지만 STEP 1 미완료 → signup flow로
        signupStore.setEmail(email);
        startOnboarding();
      } else {
        completeOnboarding();
      }

      setRole('student');
      setSessionStatus('authenticated');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [
    email,
    password,
    setSessionStatus,
    setRole,
    updateStudentProfile,
    startOnboarding,
    completeOnboarding,
    signupStore,
  ]);

  return (
    <OnboardingLayout
      title='비밀번호를 입력해주세요'
      description={email}
      onPressCTA={handleLogin}
      ctaDisabled={isLoading || !password}
      ctaLabel={isLoading ? '로그인 중...' : '로그인'}
      onPressBack={() => navigation.goBack()}>
      <View className='gap-[8px]'>
        <View className='relative'>
          <TextInput
            className='rounded-[10px] border border-gray-300 bg-white px-[16px] py-[14px] pr-[48px] text-[16px]'
            placeholder='비밀번호'
            placeholderTextColor={colors['gray-400']}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError(null);
            }}
            editable={!isLoading}
          />
          <AnimatedPressable
            className='absolute top-[14px] right-[12px]'
            onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOffIcon size={20} color={colors['gray-500']} />
            ) : (
              <EyeIcon size={20} color={colors['gray-500']} />
            )}
          </AnimatedPressable>
        </View>
        {error && <Text className='typo-caption-regular text-red-500'>{error}</Text>}
      </View>
      <AnimatedPressable
        className='mt-[16px] items-center py-[8px]'
        onPress={() => navigation.navigate('ForgotEmail', { email })}>
        <Text className='typo-body-1-regular text-gray-600'>비밀번호를 잊으셨나요?</Text>
      </AnimatedPressable>
    </OnboardingLayout>
  );
};

export default EmailLoginScreen;
