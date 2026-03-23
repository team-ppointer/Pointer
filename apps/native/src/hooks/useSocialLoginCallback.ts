import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';

const shouldStartOnboarding = (flag?: string | string[] | null): boolean => {
  if (flag === undefined || flag === null) {
    return false;
  }

  if (Array.isArray(flag)) {
    return flag.some((value) => shouldStartOnboarding(value));
  }

  return flag.toLowerCase() === 'true';
};

const useSocialLoginCallback = () => {
  const { setSessionStatus, setRole } = useAuthStore();
  const startOnboarding = useOnboardingStore((state) => state.start);
  const completeOnboarding = useOnboardingStore((state) => state.complete);

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const { url } = event;

      const parsed = Linking.parse(url);

      const isExpoGoScheme = parsed.scheme === 'exp' && parsed.path?.includes('auth/callback');
      const isPointerScheme = parsed.scheme === 'pointer' && parsed.path?.includes('auth/callback');
      const isWebPath = Platform.OS === 'web' && parsed.path?.includes('/auth/callback');

      if (!isExpoGoScheme && !isPointerScheme && !isWebPath) return;

      const { success, isFirstLogin, accessToken, refreshToken } = parsed.queryParams ?? {};

      if (!success || !accessToken) {
        setSessionStatus('unauthenticated');
        return;
      }

      setAccessToken(String(accessToken));
      if (refreshToken) setRefreshToken(String(refreshToken));

      setRole('student');
      setSessionStatus('authenticated');

      // isFirstLogin인 경우에만 온보딩, 아니면 바로 메인 홈으로
      if (shouldStartOnboarding(isFirstLogin)) {
        startOnboarding();
      } else {
        completeOnboarding();
      }
    };

    const sub = Linking.addEventListener('url', handleUrl);

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => {
      sub.remove();
    };
  }, [setSessionStatus, setRole, startOnboarding, completeOnboarding]);
};

export default useSocialLoginCallback;
