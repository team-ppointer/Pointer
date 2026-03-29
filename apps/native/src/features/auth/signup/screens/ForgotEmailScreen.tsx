import { useState, useCallback } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { postPasswordResetSendCode } from '@apis/student';

import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { OnboardingLayout } from '@features/student/onboarding/components';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotEmail'>;

const ForgotEmailScreen = ({ navigation, route }: Props) => {
  const { email } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: apiError } = await postPasswordResetSendCode({ email });
      if (apiError) {
        throw new Error('인증 코드 전송에 실패했습니다.');
      }
      navigation.navigate('ForgotCode', { email });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '인증 코드 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [email, navigation]);

  return (
    <OnboardingLayout
      title='비밀번호 찾기'
      description={`${email}로 인증 코드를 보내드립니다.`}
      onPressCTA={handleSendCode}
      ctaDisabled={isLoading}
      ctaLabel={isLoading ? '전송 중...' : '인증 코드 받기'}
      onPressBack={() => navigation.goBack()}>
      {error && (
        <View>
          <Text className='text-14r text-red-500'>{error}</Text>
        </View>
      )}
    </OnboardingLayout>
  );
};

export default ForgotEmailScreen;
