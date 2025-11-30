import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { LoadingScreen } from '@components/common/LoadingScreen';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';

const AuthCallbackScreen = () => {
  const { setSessionStatus, setRole } = useAuthStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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
    navigation.reset({
      index: 0,
      routes: [{ name: 'StudentApp' }],
    });
  }, [navigation, setRole, setSessionStatus]);

  return <LoadingScreen label='로그인 중입니다...' />;
};

export default AuthCallbackScreen;
