import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';

import StudentNavigator from '@navigation/student/StudentNavigator';
import AuthNavigator from '@navigation/auth/AuthNavigator';
import { useAuthStore } from '@stores';
import { LoadingScreen } from '@components/common';
import { useSocialLoginCallback } from '@hooks';
import { useSignupStore } from '@features/auth/signup/store/useSignupStore';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  StudentApp: undefined;
};

const NativeStack = createNativeStackNavigator<RootStackParamList>();
const WebStack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const step1Completed = useSignupStore((s) => s.step1Completed);
  const onboardingStatus = useOnboardingStore((s) => s.status);

  useSocialLoginCallback();

  // Auth 스택을 두 가지 이유로 표시: unauthenticated / signup 진행 중
  // sessionStatus가 바뀔 때 key를 변경하여 AuthNavigator를 재마운트 (스택 리셋)
  const getActiveScreen = () => {
    if (
      sessionStatus === 'unknown' ||
      sessionStatus === 'hydrating' ||
      sessionStatus === 'checking'
    ) {
      return { name: 'Splash' as const, component: LoadingScreen, key: 'splash' };
    }

    if (sessionStatus === 'unauthenticated') {
      return { name: 'Auth' as const, component: AuthNavigator, key: 'auth-login' };
    }

    // authenticated + STEP 1 미완료 (신규 회원 signup flow 진행 중) → Auth 스택 유지
    if (onboardingStatus === 'in-progress' && !step1Completed) {
      return { name: 'Auth' as const, component: AuthNavigator, key: 'auth-signup' };
    }

    // authenticated + STEP 1 완료 or 기존 회원 → StudentNavigator (onboarding 체크 포함)
    return { name: 'StudentApp' as const, component: StudentNavigator, key: 'student' };
  };

  const activeScreen = getActiveScreen();

  const isWeb = Platform.OS === 'web';
  const Stack = isWeb ? WebStack : NativeStack;

  return (
    <Stack.Navigator key={activeScreen.key} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={activeScreen.name} component={activeScreen.component} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
