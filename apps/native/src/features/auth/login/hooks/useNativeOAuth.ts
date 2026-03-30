import { useState, useCallback, useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login as kakaoLogin, logout as kakaoLogout } from '@react-native-kakao/user';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { postOauthNative, type OAuthNativeUser } from '@apis';
import { setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';
import { useSignupStore } from '@features/auth/signup/store/useSignupStore';
import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';

export type OAuthProvider = 'KAKAO' | 'GOOGLE' | 'APPLE';

type OAuthState = {
  loadingProvider: OAuthProvider | null;
  error: string | null;
};

type UseNativeOAuthReturn = OAuthState & {
  isLoading: boolean;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
};

const useNativeOAuth = (): UseNativeOAuthReturn => {
  const [state, setState] = useState<OAuthState>({
    loadingProvider: null,
    error: null,
  });

  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { setSessionStatus, setRole, updateStudentProfile } = useAuthStore();
  const startOnboarding = useOnboardingStore((state) => state.start);
  const completeOnboarding = useOnboardingStore((state) => state.complete);
  const signupStore = useSignupStore();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }, []);

  const getGoogleToken = async (): Promise<string> => {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();

    if (!tokens.idToken) {
      throw new Error('Google ID token not found');
    }

    return tokens.idToken;
  };

  const getKakaoToken = async (): Promise<string> => {
    const result = await kakaoLogin();

    if (!result.accessToken) {
      throw new Error('Kakao access token not found');
    }

    return result.accessToken;
  };

  const getAppleToken = async (): Promise<string> => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple identity token not found');
    }

    return credential.identityToken;
  };

  const getProviderToken = async (provider: OAuthProvider): Promise<string> => {
    switch (provider) {
      case 'GOOGLE':
        return getGoogleToken();
      case 'KAKAO':
        return getKakaoToken();
      case 'APPLE':
        return getAppleToken();
    }
  };

  const handleAuthSuccess = useCallback(
    async (
      response: { accessToken?: string; refreshToken?: string; user?: OAuthNativeUser },
      provider: OAuthProvider
    ) => {
      const { accessToken, refreshToken, user } = response;

      if (!accessToken) {
        throw new Error('Access token not found in response');
      }

      await setAccessToken(accessToken);
      if (refreshToken) {
        await setRefreshToken(refreshToken);
      }

      if (user) {
        await updateStudentProfile({
          name: user.name ?? null,
          grade: user.grade ?? null,
        });
      }

      const isFirstLogin = user?.isFirstLogin ?? false;

      if (isFirstLogin) {
        // 신규 회원: 토큰 저장 후 signup flow로 명시적 이동
        signupStore.setProvider(provider);
        startOnboarding();
        setRole('student');
        setSessionStatus('authenticated');
        navigation.reset({ index: 0, routes: [{ name: 'SignupEmail' }] });
      } else {
        completeOnboarding();
        setRole('student');
        setSessionStatus('authenticated');
      }
    },
    [
      setRole,
      setSessionStatus,
      updateStudentProfile,
      startOnboarding,
      completeOnboarding,
      signupStore,
      navigation,
    ]
  );

  const signInWithProvider = useCallback(
    async (provider: OAuthProvider) => {
      setState({ loadingProvider: provider, error: null });

      try {
        const token = await getProviderToken(provider);

        const response = await postOauthNative({
          provider,
          token,
        });

        if (!response.success) {
          throw new Error(response.message ?? 'Login failed');
        }

        await handleAuthSuccess(
          {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: response.user,
          },
          provider
        );

        setState({ loadingProvider: null, error: null });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        // Apple 로그인 취소는 에러로 처리하지 않음
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code: string }).code === 'ERR_REQUEST_CANCELED'
        ) {
          setState({ loadingProvider: null, error: null });
          return;
        }

        console.error(`[OAuth ${provider}] Error:`, error);
        setState({ loadingProvider: null, error: errorMessage });
        setSessionStatus('unauthenticated');
      }
    },
    [handleAuthSuccess, setSessionStatus]
  );

  const signOut = useCallback(async () => {
    try {
      // Google sign out
      try {
        await GoogleSignin.signOut();
      } catch {
        // Google signout might fail if not logged in
      }

      // Kakao sign out
      try {
        await kakaoLogout();
      } catch {
        // Kakao logout might fail if not logged in
      }

      // Apple doesn't have a sign out API
    } catch (error) {
      console.error('[OAuth] Sign out error:', error);
    }
  }, []);

  return {
    ...state,
    isLoading: state.loadingProvider !== null,
    signInWithProvider,
    signOut,
  };
};

export default useNativeOAuth;
