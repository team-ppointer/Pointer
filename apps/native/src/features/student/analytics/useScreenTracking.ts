import { useEffect, useRef } from 'react';
import { useNavigationState, type NavigationState } from '@react-navigation/native';

import type { ScreenName } from './types';

import { analytics } from './index';

/**
 * Map navigation route names to analytics screen names
 */
const ROUTE_TO_SCREEN_MAP: Record<string, ScreenName> = {
  // Tab screens
  Home: 'Main',
  Scrap: 'Scrap',
  Qna: 'QnA',
  AllMenu: 'Settings',

  // Student screens
  Problem: 'Problem',
  Pointing: 'Pointing',
  Analysis: 'StudyDetail',
  AllPointings: 'StudyList',
  Notifications: 'Notification',
  NotificationDetail: 'Notification',
  ChatRoom: 'QnAChat',
  QnaSearch: 'QnA',
  ScrapContent: 'Scrap',
  ScrapContentDetail: 'ScrapDetail',
  DeletedScrap: 'Scrap',
  SearchScrap: 'Scrap',

  // Menu screens
  MenuMain: 'Settings',
  MyInfo: 'Profile',
  NotificationSettings: 'Settings',
  Notice: 'Notification',
  Feedback: 'Settings',
  Terms: 'Settings',
  Withdrawal: 'Settings',
  EditNickname: 'Profile',
  EditSchool: 'Profile',
  EditGrade: 'Profile',
  EditMathSubject: 'Profile',
  EditPhoneNumber: 'Profile',
};

/**
 * Get the active route name from navigation state
 */
function getActiveRouteName(
  state: NavigationState | Partial<NavigationState> | undefined
): string | undefined {
  if (!state || state.index == null || !state.routes) return undefined;

  const route = state.routes[state.index];

  // Handle nested navigators
  if (route.state) {
    return getActiveRouteName(route.state as NavigationState | Partial<NavigationState>);
  }

  return route.name;
}

interface ScreenTrackingState {
  screenName: ScreenName | null;
  enterTime: number;
}

/**
 * Hook for tracking screen navigation events within StudentNavigator
 * Uses useNavigationState to track route changes
 */
export function useScreenTracking() {
  const currentScreen = useRef<ScreenTrackingState>({
    screenName: null,
    enterTime: 0,
  });
  const isInitialized = useRef(false);

  // Get the current route name from navigation state
  const routeName = useNavigationState((state) => getActiveRouteName(state));

  useEffect(() => {
    if (!routeName) return;

    const screenName = ROUTE_TO_SCREEN_MAP[routeName];
    if (!screenName) {
      // Route not mapped, skip tracking
      if (__DEV__) {
        console.log('[Analytics] Unmapped route:', routeName);
      }
      return;
    }

    const previousScreen = currentScreen.current.screenName;

    // Skip if same screen
    if (previousScreen === screenName) return;

    // Track exit from previous screen
    if (previousScreen && isInitialized.current) {
      const dwellTimeMs = Date.now() - currentScreen.current.enterTime;
      analytics.track('SCREEN_EXIT', {
        screenName: previousScreen,
        dwellTimeMs,
        nextScreen: screenName,
        exitReason: 'navigation',
      });
    }

    // Track enter to new screen
    analytics.setCurrentScreen(screenName);
    analytics.track('SCREEN_ENTER', {
      screenName,
      ...(previousScreen && { previousScreen }),
    });

    currentScreen.current = {
      screenName,
      enterTime: Date.now(),
    };

    isInitialized.current = true;
  }, [routeName]);
}
