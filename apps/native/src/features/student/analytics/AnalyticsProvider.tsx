import React, { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

import type { DeviceType } from './types';

import { analytics } from './index';

const ANALYTICS_VERSION_KEY = '@analytics_version';
const CURRENT_ANALYTICS_VERSION = 2; // Bump this to clear queue on next update

/**
 * Determine device type based on screen characteristics
 */
function getDeviceType(): DeviceType {
  if (Platform.OS === 'web') {
    return 'DESKTOP';
  }

  const deviceType = Device.deviceType;
  if (deviceType === Device.DeviceType.TABLET) {
    return 'TABLET';
  }
  if (deviceType === Device.DeviceType.PHONE) {
    return 'MOBILE';
  }

  return 'UNKNOWN';
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics Provider
 *
 * Handles analytics lifecycle:
 * - Initialize analytics on mount
 * - Track SESSION_START / SESSION_END
 * - Flush on app background
 *
 * Wrap your app with this provider:
 *
 *   <AnalyticsProvider>
 *     <App />
 *   </AnalyticsProvider>
 */
export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const sessionStartTime = useRef<number>(Date.now());
  const isInitialized = useRef(false);

  useEffect(() => {
    // Initialize analytics
    const initAnalytics = async () => {
      if (isInitialized.current) return;

      // Check for analytics version migration
      const storedVersion = await AsyncStorage.getItem(ANALYTICS_VERSION_KEY);
      const needsMigration = storedVersion !== String(CURRENT_ANALYTICS_VERSION);

      if (needsMigration) {
        if (__DEV__) {
          console.log('[Analytics] 🔄 Migration needed, clearing old queue...');
        }
        await analytics.clearQueue();
        await AsyncStorage.setItem(ANALYTICS_VERSION_KEY, String(CURRENT_ANALYTICS_VERSION));
      }

      const deviceType = getDeviceType();
      const appVersion = Constants.expoConfig?.version ?? 'unknown';
      const osVersion = `${Platform.OS} ${Platform.Version}`;

      await analytics.init({
        deviceType,
        appVersion,
        osVersion,
      });

      isInitialized.current = true;
      sessionStartTime.current = Date.now();

      // Track session start
      analytics.track('SESSION_START', {
        appVersion,
        osVersion,
      });
    };

    initAnalytics();

    // Cleanup on unmount
    return () => {
      if (isInitialized.current) {
        const sessionDurationMs = Date.now() - sessionStartTime.current;
        analytics.track('SESSION_END', { sessionDurationMs });
        analytics.flush();
        analytics.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (!isInitialized.current) return;

      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Flush events when going to background
        analytics.flush();
      } else if (nextAppState === 'active') {
        // Retry flush when coming back to foreground
        analytics.flush();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return <>{children}</>;
};
