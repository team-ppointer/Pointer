import { analyticsQueue } from './queue';
import type {
  AnalyticsEvent,
  ButtonClickMetadata,
  ButtonId,
  DeviceInfo,
  DeviceType,
  EventMetadata,
  EventType,
  ScreenName,
} from './types';

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Analytics tracker - handles event creation and validation
 */
class AnalyticsTracker {
  private initialized = false;
  private sessionId: string = '';
  private userId: string | null = null;
  private currentScreen: ScreenName | null = null;
  private deviceInfo: DeviceInfo | null = null;

  /**
   * Initialize the tracker with device info
   */
  async init(deviceInfo: DeviceInfo): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.deviceInfo = deviceInfo;
    this.sessionId = generateUUID();

    await analyticsQueue.init(this.sessionId, deviceInfo.deviceType);

    this.initialized = true;

    if (__DEV__) {
      console.log('[Analytics] Initialized with session:', this.sessionId);
    }
  }

  /**
   * Set the current user ID (after login)
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
    if (__DEV__) {
      console.log('[Analytics] User ID set:', userId);
    }
  }

  /**
   * Set the current screen name
   */
  setCurrentScreen(screenName: ScreenName): void {
    this.currentScreen = screenName;
  }

  /**
   * Get the current screen name
   */
  getCurrentScreen(): ScreenName | null {
    return this.currentScreen;
  }

  /**
   * Get the session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get device info
   */
  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * Track an event
   */
  async track(eventType: EventType, metadata: EventMetadata = {}): Promise<void> {
    if (!this.initialized) {
      if (__DEV__) {
        console.warn('[Analytics] Not initialized, dropping event:', eventType);
      }
      return;
    }

    const event: AnalyticsEvent = {
      eventType,
      occurredAt: new Date().toISOString(),
      metadata: {
        ...metadata,
        // Add userId if available
        ...(this.userId && { userId: this.userId }),
      },
    };

    if (__DEV__) {
      console.log('[Analytics] Track:', eventType, metadata);
    }

    await analyticsQueue.enqueue(event);
  }

  /**
   * Track a button click event
   * Convenience method that auto-injects current screen
   */
  async trackButtonClick(
    buttonId: ButtonId,
    buttonLabel?: string,
    screenNameOverride?: ScreenName
  ): Promise<void> {
    const screenName = screenNameOverride ?? this.currentScreen;

    if (!screenName) {
      if (__DEV__) {
        console.warn('[Analytics] No screen name for button click:', buttonId);
      }
      return;
    }

    const metadata: ButtonClickMetadata = {
      buttonId,
      screenName,
      ...(buttonLabel && { buttonLabel }),
    };

    await this.track('BUTTON_CLICK', metadata);
  }

  /**
   * Flush pending events immediately
   */
  async flush(): Promise<void> {
    await analyticsQueue.flush();
  }

  /**
   * Stop the tracker (call on app termination)
   */
  stop(): void {
    analyticsQueue.stop();
  }
}

export const analyticsTracker = new AnalyticsTracker();
