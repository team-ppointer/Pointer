import 'react-native-gesture-handler';
import React, { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from '@navigation/RootNavigator';
import { colors } from '@theme/tokens';
import '@/app/providers/global.css';
import '@/app/providers/api';

import { useLoadAssets, useDeepLinkHandler } from '@hooks';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/features/student/scrap/components/Notification/Toast';
import { PointingFeedbackQueueWiring } from '@/features/student/problem/services/PointingFeedbackQueueWiring';
import { BubbleQuestionPressQueueWiring } from '@features/student/problem/services/BubbleQuestionPressQueueWiring';
import { env } from '@utils';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import {
  navigationRef,
  handleNavigationReady,
  handleNavigationStateChange,
} from '@/services/navigation';

initializeKakaoSDK(env.kakaoNativeAppKey);

const queryClient = new QueryClient();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors['gray-100'],
    card: colors['blue-100'],
  },
};

if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
(Text as any).defaultProps.allowFontScaling = false;
(Text as any).defaultProps.style = [{ fontFamily: 'Pretendard' }];

if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
(TextInput as any).defaultProps.allowFontScaling = false;
(TextInput as any).defaultProps.style = [{ fontFamily: 'Pretendard' }];

export default function App() {
  const { isReady } = useLoadAssets();

  // FCM 푸시 알림 딥링크 핸들러
  useDeepLinkHandler();

  // NavigationContainer가 완전히 마운트된 후 native splash 제거
  const handleNavigationContainerReady = useCallback(() => {
    handleNavigationReady();
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PointingFeedbackQueueWiring />
      <BubbleQuestionPressQueueWiring />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {isReady && (
            <NavigationContainer
              ref={navigationRef}
              theme={navigationTheme}
              onReady={handleNavigationContainerReady}
              onStateChange={handleNavigationStateChange}>
              <StatusBar style='dark' />
              <RootNavigator />
              <Toast config={toastConfig} />
            </NavigationContainer>
          )}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
