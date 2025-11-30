import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';

export function useSocialLoginCallback() {
  const { setSessionStatus, setRole } = useAuthStore();

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const { url } = event;

      const parsed = Linking.parse(url);

      const isPointerScheme = parsed.scheme === 'pointer' && parsed.path === 'auth/callback';
      const isWebPath = Platform.OS === 'web' && parsed.path === '/auth/callback';

      if (!isPointerScheme && !isWebPath) return;

      const { success, isFirstLogin, accessToken, refreshToken } = parsed.queryParams ?? {};

      if (!success || !accessToken) {
        setSessionStatus('unauthenticated');
        return;
      }

      setAccessToken(String(accessToken));
      if (refreshToken) setRefreshToken(String(refreshToken));

      setRole('student');
      setSessionStatus('authenticated');
    };

    const sub = Linking.addEventListener('url', handleUrl);

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => {
      sub.remove();
    };
  }, [setSessionStatus, setRole]);
}
