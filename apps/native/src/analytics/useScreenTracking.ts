import { useCallback, useRef } from 'react';
import { NavigationState } from '@react-navigation/native';
import { analytics } from './index';
import type { ScreenName } from './types';

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
  EditScore: 'Profile',
  EditMathSubject: 'Profile',
  EditPhoneNumber: 'Profile',
};

/**
 * Get the active route name from navigation state
 */
function getActiveRouteName(state: NavigationState | undefined): string | undefined {
  if (!state) return undefined;

  const route = state.routes[state.index];

  // Handle nested navigators
  if (route.state) {
    return getActiveRouteName(route.state as NavigationState);
  }

  return route.name;
}

/**
 * Get route params from navigation state
 */
function getActiveRouteParams(
  state: NavigationState | undefined
): Record<string, unknown> | undefined {
  if (!state) return undefined;

  const route = state.routes[state.index];

  // Handle nested navigators
  if (route.state) {
    return getActiveRouteParams(route.state as NavigationState);
  }

  return route.params as Record<string, unknown> | undefined;
}

interface ScreenTrackingState {
  screenName: ScreenName | null;
  enterTime: number;
}

/**
 * Hook for tracking screen navigation events
 *
 * Usage:
 *   const { onStateChange, onReady } = useScreenTracking();
 *
 *   <NavigationContainer
 *     onStateChange={onStateChange}
 *     onReady={onReady}
 *   >
 */
export function useScreenTracking() {
  const currentScreen = useRef<ScreenTrackingState>({
    screenName: null,
    enterTime: 0,
  });
  const isReady = useRef(false);

  const trackScreenEnter = useCallback(
    (screenName: ScreenName, previousScreen: ScreenName | null, params?: Record<string, unknown>) => {
      analytics.setCurrentScreen(screenName);
      analytics.track('SCREEN_ENTER', {
        screenName,
        ...(previousScreen && { previousScreen }),
        ...(params && { params }),
      });

      currentScreen.current = {
        screenName,
        enterTime: Date.now(),
      };
    },
    []
  );

  const trackScreenExit = useCallback(
    (screenName: ScreenName, nextScreen: ScreenName | null, exitReason: 'navigation' | 'back') => {
      const dwellTimeMs = Date.now() - currentScreen.current.enterTime;

      analytics.track('SCREEN_EXIT', {
        screenName,
        dwellTimeMs,
        ...(nextScreen && { nextScreen }),
        exitReason,
      });

      // Flush is handled automatically by queue (threshold or timer)
    },
    []
  );

  const onStateChange = useCallback(
    (state: NavigationState | undefined) => {
      if (!isReady.current || !state) return;

      const routeName = getActiveRouteName(state);
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
      if (previousScreen) {
        trackScreenExit(previousScreen, screenName, 'navigation');
      }

      // Track enter to new screen
      const params = getActiveRouteParams(state);
      trackScreenEnter(screenName, previousScreen, params);
    },
    [trackScreenEnter, trackScreenExit]
  );

  const onReady = useCallback(() => {
    isReady.current = true;

    // Track initial screen
    const initialScreen: ScreenName = 'Main';
    trackScreenEnter(initialScreen, null);
  }, [trackScreenEnter]);

  return { onStateChange, onReady };
}
