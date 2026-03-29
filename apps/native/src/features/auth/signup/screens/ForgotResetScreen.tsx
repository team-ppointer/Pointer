import { useState, useCallback } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';

import { AnimatedPressable } from '@components/common';
import { colors } from '@theme/tokens';
import { postPasswordReset } from '@apis/student';
import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { OnboardingLayout } from '@features/student/onboarding/components';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotReset'>;

const ForgotResetScreen = ({ navigation, route }: Props) => {
  const { email, code } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = useCallback(async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { error: apiError } = await postPasswordReset({
        email,
        code,
        newPassword,
      });
      if (apiError) {
        throw new Error('비밀번호 재설정에 실패했습니다.');
      }
      // 비밀번호 재설정 성공 → 로그인 화면으로 돌아가기
      navigation.navigate('EmailLogin', { email });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [email, code, newPassword, navigation]);

  return (
    <OnboardingLayout
      title='새 비밀번호 설정'
      onPressCTA={handleReset}
      ctaDisabled={isLoading || !newPassword}
      ctaLabel={isLoading ? '변경 중...' : '비밀번호 변경'}
      onPressBack={() => navigation.goBack()}>
      <View className='gap-[8px]'>
        <View className='relative'>
          <TextInput
            className='rounded-[10px] border border-gray-300 bg-white px-[16px] py-[14px] pr-[48px] text-[16px]'
            placeholder='새 비밀번호 (8자 이상)'
            placeholderTextColor={colors['gray-400']}
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
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
    </OnboardingLayout>
  );
};

export default ForgotResetScreen;
