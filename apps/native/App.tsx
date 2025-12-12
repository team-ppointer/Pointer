import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from '@navigation/RootNavigator';
import { colors } from '@theme/tokens';
import '@/app/providers/global.css';
import '@/app/providers/api';
import { LoadingScreen } from '@components/common';
import { useLoadAssets } from '@hooks';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/features/student/scrap/components/Modal/Toast';

const queryClient = new QueryClient();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors['gray-100'],
    card: colors['blue-100'],
  },
};

const linking = {
  prefixes: ['pointer://', 'http://localhost:3000'],
  config: {
    screens: {
      AuthCallback: 'auth/callback',
    },
  },
};

export default function App() {
  const { loading } = useLoadAssets();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer theme={navigationTheme} linking={linking}>
            <StatusBar style='dark' />
            <RootNavigator />
            <Toast config={toastConfig} />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
