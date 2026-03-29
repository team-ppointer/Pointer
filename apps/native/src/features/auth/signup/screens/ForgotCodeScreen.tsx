import { useState, useCallback } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';
import { postPasswordResetVerifyCode, postPasswordResetSendCode } from '@apis/student';

import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { OnboardingLayout } from '@features/student/onboarding/components';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotCode'>;

const ForgotCodeScreen = ({ navigation, route }: Props) => {
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: apiError } = await postPasswordResetVerifyCode({
        email,
        code,
        newPassword: '',
      });
      if (apiError) {
        throw new Error('인증 코드가 올바르지 않습니다.');
      }
      navigation.navigate('ForgotReset', { email, code });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '인증 코드 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [email, code, navigation]);

  const handleResend = useCallback(async () => {
    setError(null);
    try {
      const { error: apiError } = await postPasswordResetSendCode({ email });
      if (apiError) {
        throw new Error('인증 코드 재전송에 실패했습니다.');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '인증 코드 재전송에 실패했습니다.');
    }
  }, [email]);

  return (
    <OnboardingLayout
      title='인증 코드 입력'
      description={`${email}로 전송된 인증 코드를 입력해주세요.`}
      onPressCTA={handleVerifyCode}
      ctaDisabled={isLoading || !code}
      ctaLabel={isLoading ? '확인 중...' : '확인'}
      onPressBack={() => navigation.goBack()}>
      <View className='gap-[8px]'>
        <TextInput
          className='rounded-[12px] border border-gray-300 bg-white px-[16px] py-[14px] text-[16px]'
          placeholder='인증 코드'
          placeholderTextColor={colors['gray-400']}
          keyboardType='number-pad'
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if (error) setError(null);
          }}
          editable={!isLoading}
        />
        {error && <Text className='text-14r text-red-500'>{error}</Text>}
      </View>
      <AnimatedPressable className='mt-[8px] items-center py-[8px]' onPress={handleResend}>
        <Text className='text-14m text-gray-600'>인증 코드 다시 받기</Text>
      </AnimatedPressable>
    </OnboardingLayout>
  );
};

export default ForgotCodeScreen;
