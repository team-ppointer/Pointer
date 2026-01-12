import { useEffect, useRef, useState } from 'react';
import { Text, View, Linking, Pressable, ScrollView } from 'react-native';
import { AnimatedPressable, Container } from '@components/common';
import { postSocialLogin } from '@apis/student';
import { env, setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';
import { GoogleIcon, KakaoIcon, PointerLogo, AppleIcon } from '@components/system/icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@theme/tokens';
import { MailIcon, ChevronRightIcon } from 'lucide-react-native';
import TermsConsentSheet from '../components/TermsConsentSheet';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login, logout } from '@react-native-kakao/user';
import * as AppleAuthentication from 'expo-apple-authentication';

const LoginScreen = () => {
  const { setSessionStatus, setRole } = useAuthStore();
  const [pendingSocial, setPendingSocial] = useState<'KAKAO' | 'GOOGLE' | null>(null);
  const [googleData, setGoogleData] = useState<{ userInfo: string; tokens: string } | null>(null);
  const [kakaoData, setKakaoData] = useState<string | null>(null);
  const [appleData, setAppleData] = useState<string | null>(null);
  const termsSheetRef = useRef<BottomSheet>(null);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const startOnboarding = useOnboardingStore((state) => state.start);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }, []);

  const handleGoogleLogin = async () => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();

    console.log(userInfo);
    console.log(tokens);

    setGoogleData({
      userInfo: JSON.stringify(userInfo, null, 2),
      tokens: JSON.stringify(tokens, null, 2),
    });
  };

  const handleKakaoLogin = async () => {
    try {
      const result = await login();
      console.log(result);

      setKakaoData(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(error);
    }
  };

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

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      console.log(credential);
      setAppleData(JSON.stringify(credential, null, 2));
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        console.log('user canceled the sign-in flow');
      } else {
        console.error(e);
      }
    }
  };

  return (
    <SafeAreaView className='flex-1' edges={['top', 'bottom']}>
      <Container className='flex-1'>
        <View className='flex-1 items-center justify-center gap-[12px] py-[10px]'>
          <PointerLogo />
          <Text className='text-16r text-gray-700'>강남 8학군의 필수 수학 학습 플랫폼</Text>
          {googleData && (
            <ScrollView className='w-full'>
              <Text className='text-12r text-gray-700'>
                UserInfo: {googleData.userInfo}
                {'\n\n'}
                Tokens: {googleData.tokens}
              </Text>
            </ScrollView>
          )}
          {kakaoData && (
            <ScrollView className='w-full'>
              <Text className='text-12r text-gray-700'>
                KakaoData: {kakaoData}
              </Text>
            </ScrollView>
          )}
          {appleData && (
            <ScrollView className='w-full'>
              <Text className='text-12r text-gray-700'>
                AppleData: {appleData}
              </Text>
            </ScrollView>
          )}
        </View>
        <View className='gap-[10px] pb-[38px] pt-[10px]'>
          <AnimatedPressable
            className='flex-row items-center justify-center gap-[8px] rounded-[8px] bg-black px-[12px] py-[10px]'
            onPress={handleAppleLogin}>
            <AppleIcon size={18} />
            <Text className='text-16m text-white'>Apple로 시작하기</Text>
          </AnimatedPressable>
          <AnimatedPressable
            className='flex-row items-center justify-center gap-[8px] rounded-[8px] bg-[#FFDE00] px-[12px] py-[10px]'
            onPress={() => handleSocialButtonPress('KAKAO')}>
            <KakaoIcon size={20} />
            <Text className='text-16m text-black'>카카오로 시작하기</Text>
          </AnimatedPressable>
          <AnimatedPressable
            className='flex-row items-center justify-center gap-[8px] rounded-[8px] border border-gray-500 bg-white px-[12px] py-[10px]'
            onPress={() => handleSocialButtonPress('GOOGLE')}>
            <GoogleIcon size={20} />
            <Text className='text-16m text-black'>Google로 시작하기</Text>
          </AnimatedPressable>
          <AnimatedPressable
            className='border-primary-200 bg-primary-100 flex-row items-center justify-center gap-[8px] rounded-[8px] border px-[12px] py-[10px]'
            onPress={() => {}}>
            <MailIcon size={20} color={colors['primary-500']} />
            <Text className='text-16m text-primary-600'>이메일로 시작하기</Text>
          </AnimatedPressable>
          {/* <View className='flex-row items-center justify-center gap-[8px] pt-[10px]'>
            <Text className='text-16r text-gray-700'>이미 회원이신가요?</Text>
            <Pressable className='flex-row items-center justify-center rounded-[8px] px-[6px] py-[2px] hover:bg-gray-300 active:bg-gray-300'>
              <Text className='text-16m text-gray-700'>로그인하기</Text>
              <ChevronRightIcon size={18} color={colors['gray-700']} />
            </Pressable>
          </View> */}
          <View className='flex-row items-center justify-center gap-[8px] pt-[10px]'>
            <Pressable
              className='flex-row items-center justify-center rounded-[8px] px-[6px] py-[2px] hover:bg-gray-300 active:bg-gray-300'
              onPress={handleGoogleLogin}>
              <Text className='text-16m text-gray-700'>구글 로그인</Text>
            </Pressable>
            <Pressable
              className='flex-row items-center justify-center rounded-[8px] px-[6px] py-[2px] hover:bg-gray-300 active:bg-gray-300'
              onPress={async () => {
                await GoogleSignin.signOut();
                setGoogleData(null);
              }}>
              <Text className='text-16m text-gray-700'>구글 로그아웃</Text>
            </Pressable>
            <Pressable
              className='flex-row items-center justify-center rounded-[8px] px-[6px] py-[2px] hover:bg-gray-300 active:bg-gray-300'
              onPress={handleKakaoLogin}>
              <Text className='text-16m text-gray-700'>카카오 로그인</Text>
            </Pressable>
            <Pressable
              className='flex-row items-center justify-center rounded-[8px] px-[6px] py-[2px] hover:bg-gray-300 active:bg-gray-300'
              onPress={async () => {
                await logout();
                setKakaoData(null);
                setGoogleData(null);
              }}>
              <Text className='text-16m text-gray-700'>카카오 로그아웃</Text>
            </Pressable>
            <Pressable
              className='flex-row items-center justify-center rounded-[8px] px-[6px] py-[2px] hover:bg-gray-300 active:bg-gray-300'
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
              <Text className='text-16m text-gray-700'>개발용 로그인</Text>
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
