import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '@theme/tokens';
import { client } from '@apis';
import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { OnboardingLayout } from '@features/student/onboarding/components';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailInput'>;

const EmailInputScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await client.GET('/api/student/auth/email/exists', {
        params: { query: { email: trimmed } },
      });

      if (apiError || data === undefined) {
        throw new Error('이메일 확인에 실패했습니다.');
      }

      const exists = data.value === true;

      if (exists) {
        navigation.navigate('EmailLogin', { email: trimmed });
      } else {
        navigation.navigate('SignupPassword', { email: trimmed });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '이메일 확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingLayout
      title='이메일을 입력해주세요'
      onPressCTA={handleNext}
      ctaDisabled={isLoading || !email.trim()}
      ctaLabel={isLoading ? '확인 중...' : '다음'}
      onPressBack={() => navigation.goBack()}>
      <View className='gap-[8px]'>
        <TextInput
          className='rounded-[10px] border border-gray-300 bg-white px-[16px] py-[14px] text-[16px]'
          placeholder='example@email.com'
          placeholderTextColor={colors['gray-400']}
          keyboardType='email-address'
          autoCapitalize='none'
          autoComplete='email'
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError(null);
          }}
          editable={!isLoading}
        />
        {error && <Text className='typo-caption-regular text-red-400'>{error}</Text>}
      </View>
    </OnboardingLayout>
  );
};

export default EmailInputScreen;
