import { useRef, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { AnimatedPressable, Container } from '@components/common';
import { GoogleIcon, KakaoIcon, PointerLogo, AppleIcon } from '@components/system/icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@theme/tokens';
import { MailIcon } from 'lucide-react-native';
import TermsConsentSheet from '../components/TermsConsentSheet';
import EmailAuthSheet from '../components/EmailAuthSheet';
import { useNativeOAuth, type OAuthProvider } from '../hooks';

const LoginScreen = () => {
  const [pendingSocial, setPendingSocial] = useState<OAuthProvider | null>(null);
  const termsSheetRef = useRef<BottomSheet>(null);
  const emailAuthSheetRef = useRef<BottomSheet>(null);
  const { bottom: bottomInset } = useSafeAreaInsets();

  const { isLoading, error, signInWithProvider } = useNativeOAuth();

  const handleSocialButtonPress = (provider: OAuthProvider) => {
    setPendingSocial(provider);
    termsSheetRef.current?.expand();
  };

  const handleEmailButtonPress = () => {
    emailAuthSheetRef.current?.expand();
  };

  const handleTermsConfirm = async () => {
    if (!pendingSocial) return;

    const provider = pendingSocial;
    termsSheetRef.current?.close();

    await signInWithProvider(provider);
  };

  const handleTermsSheetChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPendingSocial(null);
    }
  };

  return (
    <SafeAreaView className='flex-1' edges={['top', 'bottom']}>
      <Container className='flex-1'>
        <View className='flex-1 items-center justify-center gap-[12px] py-[10px]'>
          <PointerLogo />
          <Text className='text-16r text-gray-700'>강남 8학군의 필수 수학 학습 플랫폼</Text>
          {error && (
            <View className='rounded-[8px] bg-red-100 px-[16px] py-[8px]'>
              <Text className='text-14r text-red-600'>{error}</Text>
            </View>
          )}
        </View>
        <View className='gap-[10px] pb-[38px] pt-[10px]'>
          <AnimatedPressable
            className='flex-row items-center justify-center gap-[8px] rounded-[8px] bg-black px-[12px] py-[10px]'
            onPress={() => handleSocialButtonPress('APPLE')}
            disabled={isLoading}>
            {isLoading && pendingSocial === 'APPLE' ? (
              <ActivityIndicator size='small' color='white' />
            ) : (
              <>
                <AppleIcon size={18} />
                <Text className='text-16m text-white'>Apple로 시작하기</Text>
              </>
            )}
          </AnimatedPressable>
          <AnimatedPressable
            className='flex-row items-center justify-center gap-[8px] rounded-[8px] bg-[#FFDE00] px-[12px] py-[10px]'
            onPress={() => handleSocialButtonPress('KAKAO')}
            disabled={isLoading}>
            {isLoading && pendingSocial === 'KAKAO' ? (
              <ActivityIndicator size='small' color='black' />
            ) : (
              <>
                <KakaoIcon size={20} />
                <Text className='text-16m text-black'>카카오로 시작하기</Text>
              </>
            )}
          </AnimatedPressable>
          <AnimatedPressable
            className='flex-row items-center justify-center gap-[8px] rounded-[8px] border border-gray-500 bg-white px-[12px] py-[10px]'
            onPress={() => handleSocialButtonPress('GOOGLE')}
            disabled={isLoading}>
            {isLoading && pendingSocial === 'GOOGLE' ? (
              <ActivityIndicator size='small' color='black' />
            ) : (
              <>
                <GoogleIcon size={20} />
                <Text className='text-16m text-black'>Google로 시작하기</Text>
              </>
            )}
          </AnimatedPressable>
          <AnimatedPressable
            className='border-primary-200 bg-primary-100 flex-row items-center justify-center gap-[8px] rounded-[8px] border px-[12px] py-[10px]'
            onPress={handleEmailButtonPress}
            disabled={isLoading}>
            <MailIcon size={20} color={colors['primary-500']} />
            <Text className='text-16m text-primary-600'>이메일로 시작하기</Text>
          </AnimatedPressable>
        </View>
      </Container>
      <TermsConsentSheet
        ref={termsSheetRef}
        bottomInset={bottomInset}
        onConfirm={handleTermsConfirm}
        onSheetChange={handleTermsSheetChange}
      />
      <EmailAuthSheet ref={emailAuthSheetRef} bottomInset={bottomInset} />
    </SafeAreaView>
  );
};

export default LoginScreen;
