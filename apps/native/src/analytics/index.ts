import { analyticsTracker } from './tracker';
import type {
  ButtonId,
  DeviceInfo,
  EventMetadata,
  EventType,
  ScreenName,
} from './types';

/**
 * Public Analytics API
 *
 * Usage:
 *   import { analytics } from '@/analytics';
 *
 *   // Initialize on app start
 *   analytics.init({ deviceType: 'MOBILE', appVersion: '1.0.0' });
 *
 *   // Set user after login
 *   analytics.setUserId('user-123');
 *
 *   // Track events
 *   analytics.track('SCREEN_ENTER', { screenName: 'Main' });
 *   analytics.trackButtonClick('start_study');
 *
 *   // Flush on app background
 *   analytics.flush();
 */
export const analytics = {
  /**
   * Initialize analytics with device info
   * Call once on app start
   */
  init: (deviceInfo: DeviceInfo) => analyticsTracker.init(deviceInfo),

  /**
   * Set the current user ID
   * Call after login, pass null on logout
   */
  setUserId: (userId: string | null) => analyticsTracker.setUserId(userId),

  /**
   * Set the current screen name
   * Called automatically by navigation tracking
   */
  setCurrentScreen: (screenName: ScreenName) => analyticsTracker.setCurrentScreen(screenName),

  /**
   * Get the current screen name
   */
  getCurrentScreen: () => analyticsTracker.getCurrentScreen(),

  /**
   * Get the current session ID
   */
  getSessionId: () => analyticsTracker.getSessionId(),

  /**
   * Track an event with metadata
   */
  track: (eventType: EventType, metadata?: EventMetadata) =>
    analyticsTracker.track(eventType, metadata),

  /**
   * Track a button click event
   * Automatically injects current screen name
   */
  trackButtonClick: (buttonId: ButtonId, buttonLabel?: string, screenName?: ScreenName) =>
    analyticsTracker.trackButtonClick(buttonId, buttonLabel, screenName),

  /**
   * Flush pending events to server
   * Call on app background or screen transition
   */
  flush: () => analyticsTracker.flush(),

  /**
   * Stop analytics (cleanup)
   * Call on app termination
   */
  stop: () => analyticsTracker.stop(),
};

// Re-export types for consumers
export type {
  ButtonId,
  DeviceInfo,
  DeviceType,
  EventMetadata,
  EventType,
  ScreenName,
  ScreenExitReason,
  StudyExitReason,
} from './types';
