import { useRef, useState } from 'react';
import { Text, View, Image, Linking, Pressable } from 'react-native';
import { Container } from '@components/common';
import { postSocialLogin } from '@apis/student';
import { env, setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';
import { GoogleIcon, KakaoIcon } from '@components/system/icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@theme/tokens';
import { MailIcon, ChevronRightIcon } from 'lucide-react-native';
import TermsConsentSheet from '../components/TermsConsentSheet';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';

const LoginScreen = () => {
  const { setSessionStatus, setRole } = useAuthStore();
  const [pendingSocial, setPendingSocial] = useState<'KAKAO' | 'GOOGLE' | null>(null);
  const termsSheetRef = useRef<BottomSheet>(null);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const startOnboarding = useOnboardingStore((state) => state.start);

  const handleLoginClick = async (social: 'KAKAO' | 'GOOGLE') => {
    try {
      const result = await postSocialLogin(social);

      if (result.isSuccess && result.loginUrl) {
        await Linking.openURL(result.loginUrl);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSocialButtonPress = (social: 'KAKAO' | 'GOOGLE') => {
    setPendingSocial(social);
    termsSheetRef.current?.expand();
  };

  const handleTermsConfirm = () => {
    if (!pendingSocial) return;
    const social = pendingSocial;
    termsSheetRef.current?.close();
    void handleLoginClick(social);
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
          <Image
            source={require('@assets/images/pointer-logo.png')}
            className='my-[10px] h-[66.8px] w-[295px]'
          />
          <Text className='text-16r text-gray-700'>강남 8학군의 필수 수학 학습 플랫폼</Text>
        </View>
        <View className='gap-[10px] pb-[38px] pt-[10px]'>
          <Pressable
            className='flex-row items-center justify-center gap-[8px] rounded-[8px] bg-[#FFDE00] px-[12px] py-[10px] hover:bg-[#F5D400] active:bg-[#F5D400]'
            onPress={() => handleSocialButtonPress('KAKAO')}>
            <KakaoIcon size={20} />
            <Text className='text-16m text-black'>카카오로 시작하기</Text>
          </Pressable>
          <Pressable
            className='flex-row items-center justify-center gap-[8px] rounded-[8px] border border-gray-500 bg-white px-[12px] py-[10px] hover:bg-gray-200 active:bg-gray-200'
            onPress={() => handleSocialButtonPress('GOOGLE')}>
            <GoogleIcon size={20} />
            <Text className='text-16m text-black'>구글로 시작하기</Text>
          </Pressable>
          <Pressable
            className='border-primary-200 bg-primary-100 hover:bg-primary-200 active:bg-primary-200 flex-row items-center justify-center gap-[8px] rounded-[8px] border px-[12px] py-[10px]'
            onPress={() => {
              const success = true;
              const isFirstLogin = false;
              const accessToken = env.devAccessToken;
              const refreshToken = env.devRefreshToken;

              if (!success || !accessToken) {
                setSessionStatus('unauthenticated');
                return;
              }

              setAccessToken(accessToken);
              if (refreshToken) setRefreshToken(refreshToken);

              startOnboarding();
              setRole('student');
              setSessionStatus('authenticated');
            }}>
            <MailIcon size={20} color={colors['primary-500']} />
            <Text className='text-16m text-primary-600'>개발용 로그인</Text>
          </Pressable>
          <View className='flex-row items-center justify-center gap-[8px] pt-[10px]'>
            <Text className='text-16r text-gray-700'>이미 회원이신가요?</Text>
            <Pressable className='flex-row items-center justify-center rounded-[8px] px-[6px] py-[2px] hover:bg-gray-300 active:bg-gray-300'>
              <Text className='text-16m text-gray-700'>로그인하기</Text>
              <ChevronRightIcon size={18} color={colors['gray-700']} />
            </Pressable>
          </View>
        </View>
      </Container>
      <TermsConsentSheet
        ref={termsSheetRef}
        bottomInset={bottomInset}
        onConfirm={handleTermsConfirm}
        onSheetChange={handleTermsSheetChange}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;
