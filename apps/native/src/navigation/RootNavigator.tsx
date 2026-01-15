import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import StudentNavigator from '@navigation/student/StudentNavigator';
import AuthNavigator from '@navigation/auth/AuthNavigator';
import { useAuthStore } from '@stores';
import { LoadingScreen } from '@components/common';
import { useSocialLoginCallback } from '@hooks';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  StudentApp: undefined;
};

const NativeStack = createNativeStackNavigator<RootStackParamList>();
const WebStack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { sessionStatus, role } = useAuthStore();

  useSocialLoginCallback();

  const getActiveScreen = () => {
    if (sessionStatus === 'unknown') {
      return { name: 'Splash' as const, component: LoadingScreen };
    }

    if (sessionStatus === 'unauthenticated') {
      return { name: 'Auth' as const, component: AuthNavigator };
    }

    // if (role === 'teacher') {
    //   return { name: 'TeacherApp' as const, component: TeacherNavigator };
    // }

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
