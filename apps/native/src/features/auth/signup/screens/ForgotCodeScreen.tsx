import { useState, useCallback } from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AnimatedPressable } from '@components/common';
import { postPasswordResetVerifyCode, postPasswordResetSendCode } from '@apis/student';
import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { OnboardingInput, OnboardingLayout } from '@features/student/onboarding/components';

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
      const { error: apiError } = await postPasswordResetVerifyCode({ email, code });
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
      <OnboardingInput
        placeholder='인증 코드'
        keyboardType='number-pad'
        value={code}
        onChangeText={(text) => {
          setCode(text);
          if (error) setError(null);
        }}
        editable={!isLoading}
        errorMessage={error ?? undefined}
      />
      <AnimatedPressable className='mt-[8px] items-center py-[8px]' onPress={handleResend}>
        <Text className='typo-body-1-regular text-gray-600'>인증 코드 다시 받기</Text>
      </AnimatedPressable>
    </OnboardingLayout>
  );
};

export default ForgotCodeScreen;
