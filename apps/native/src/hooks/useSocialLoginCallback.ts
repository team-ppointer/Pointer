import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';

const shouldStartOnboarding = (flag?: string | string[] | null): boolean => {
  if (flag === undefined || flag === null) {
    return true;
  }

  if (Array.isArray(flag)) {
    return flag.some((value) => shouldStartOnboarding(value));
  }

  return flag.toLowerCase() !== 'false';
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

      // if (shouldStartOnboarding(isFirstLogin)) {
      if (shouldStartOnboarding('true')) {
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
