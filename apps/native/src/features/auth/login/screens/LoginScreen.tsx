import { Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MailIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AnimatedPressable, Container } from '@components/common';
import { GoogleIcon, KakaoIcon, PointerLogo, AppleIcon } from '@components/system/icons';
import { colors } from '@theme/tokens';
import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';

import { useNativeOAuth, type OAuthProvider } from '../hooks';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isLoading, error, signInWithProvider } = useNativeOAuth();

  const handleSocialButtonPress = async (provider: OAuthProvider) => {
    await signInWithProvider(provider);
  };

  const handleEmailButtonPress = () => {
    navigation.navigate('EmailInput');
  };

  return (
    <SafeAreaView className='flex-1' edges={['top', 'bottom']}>
      <Container className='flex-1'>
        <View className='flex-1 items-center justify-center gap-[12px]'>
          <PointerLogo />
          <Text className='typo-body-1-regular text-gray-700'>
            강남 8학군의 필수 수학 학습 플랫폼
          </Text>
        </View>
        <View className='gap-[10px] pt-[10px] pb-[38px]'>
          {error && (
            <View className='rounded-[8px] bg-red-100 px-[16px] py-[8px]'>
              <Text className='typo-label-regular text-red-600'>{error}</Text>
            </View>
          )}
          <AnimatedPressable
            className='h-[48px] flex-row items-center justify-center gap-[8px] rounded-[8px] bg-black px-[20px]'
            onPress={() => handleSocialButtonPress('APPLE')}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size='small' color='white' />
            ) : (
              <>
                <AppleIcon size={20} />
                <Text className='typo-body-1-medium text-white'>Apple로 시작하기</Text>
              </>
            )}
          </AnimatedPressable>
          <AnimatedPressable
            className='h-[48px] flex-row items-center justify-center gap-[8px] rounded-[8px] bg-[#FFDE00] px-[20px]'
            onPress={() => handleSocialButtonPress('KAKAO')}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size='small' color='black' />
            ) : (
              <>
                <KakaoIcon size={20} />
                <Text className='typo-body-1-medium text-black'>카카오로 시작하기</Text>
              </>
            )}
          </AnimatedPressable>
          <AnimatedPressable
            className='h-[48px] flex-row items-center justify-center gap-[8px] rounded-[8px] border border-gray-500 bg-white px-[20px]'
            onPress={() => handleSocialButtonPress('GOOGLE')}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size='small' color='black' />
            ) : (
              <>
                <GoogleIcon size={20} />
                <Text className='typo-body-1-medium text-black'>Google로 시작하기</Text>
              </>
            )}
          </AnimatedPressable>
          <AnimatedPressable
            className='border-primary-200 bg-primary-100 h-[48px] flex-row items-center justify-center gap-[8px] rounded-[8px] border px-[20px]'
            onPress={handleEmailButtonPress}
            disabled={isLoading}>
            <MailIcon size={20} color={colors['primary-500']} />
            <Text className='typo-body-1-medium text-primary-600'>이메일로 시작하기</Text>
          </AnimatedPressable>
        </View>
      </Container>
    </SafeAreaView>
  );
};

export default LoginScreen;
