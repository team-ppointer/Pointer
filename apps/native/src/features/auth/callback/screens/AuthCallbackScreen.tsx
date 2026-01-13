import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { LoadingScreen } from '@components/common';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';

const shouldStartOnboarding = (flag: string | null) => {
  if (flag === null) {
    return false;
  }

  return flag.toLowerCase() === 'true';
};

const AuthCallbackScreen = () => {
  const { setSessionStatus, setRole } = useAuthStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const startOnboarding = useOnboardingStore((state) => state.start);
  const completeOnboarding = useOnboardingStore((state) => state.complete);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const success = params.get('success');
    const isFirstLogin = params.get('isFirstLogin');
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!success || !accessToken) {
      setSessionStatus('unauthenticated');
      return;
    }

    setAccessToken(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);

    setRole('student');
    setSessionStatus('authenticated');

    if (shouldStartOnboarding(isFirstLogin)) {
      startOnboarding();
    } else {
      completeOnboarding();
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'StudentApp' }],
    });
  }, [navigation, setRole, setSessionStatus, completeOnboarding, startOnboarding]);

  return <LoadingScreen label='로그인 중입니다...' />;
};

export default AuthCallbackScreen;
