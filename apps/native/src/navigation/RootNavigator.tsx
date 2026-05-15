import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';

import StudentNavigator from '@navigation/student/StudentNavigator';
import AuthNavigator from '@navigation/auth/AuthNavigator';
import { useAuthStore } from '@stores';
import { LoadingScreen } from '@components/common';
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

  const getActiveScreen = () => {
    if (
      sessionStatus === 'unknown' ||
      sessionStatus === 'hydrating' ||
      sessionStatus === 'checking'
    ) {
      return { name: 'Splash' as const, component: LoadingScreen };
    }

    if (sessionStatus === 'unauthenticated') {
      return { name: 'Auth' as const, component: AuthNavigator };
    }

    // authenticated + STEP 1 미완료 (신규 회원 signup flow 진행 중) → Auth 스택 유지
    // AuthNavigator 내부에서 store 상태 기반으로 initialRoute 결정
    if (onboardingStatus === 'in-progress' && !step1Completed) {
      return { name: 'Auth' as const, component: AuthNavigator };
    }

    // authenticated + STEP 1 완료 or 기존 회원 → StudentNavigator (onboarding 체크 포함)
    return { name: 'StudentApp' as const, component: StudentNavigator };
  };

  const activeScreen = getActiveScreen();

  const isWeb = Platform.OS === 'web';
  const Stack = isWeb ? WebStack : NativeStack;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={activeScreen.name} component={activeScreen.component} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
