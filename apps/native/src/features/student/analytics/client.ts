import { client } from '@/apis/client';
import type { components } from '@schema';

import type { AnalyticsEvent, DeviceType } from './types';

type UserEventBatchRequest = components['schemas']['UserEventBatchRequest'];

interface SendEventsParams {
  events: AnalyticsEvent[];
  sessionId: string;
  deviceType: DeviceType;
}

interface SendResult {
  success: boolean;
  shouldRetry: boolean;
}

/**
 * Analytics API client
 * Handles communication with the analytics events endpoint
 */
export const analyticsClient = {
  /**
   * Send events batch to the server
   * @returns success status and whether to retry on failure
   */
  async sendEvents({ events, sessionId, deviceType }: SendEventsParams): Promise<SendResult> {
    const requestBody = {
      events: events.map((event) => ({
        eventType: event.eventType,
        occurredAt: event.occurredAt,
        metadata: event.metadata,
      })),
      sessionId,
      deviceType,
    };

    if (__DEV__) {
      console.log('[Analytics] 🌐 POST /api/analytics/events');
      console.log('[Analytics] 📦 Request body:', JSON.stringify(requestBody, null, 2));
    }

    try {
      const response = await client.POST('/api/analytics/events', {
        body: requestBody as unknown as UserEventBatchRequest,
      });

      if (response.response.ok) {
        if (__DEV__) {
          console.log('[Analytics] ✅ POST successful (204)');
        }
        return { success: true, shouldRetry: false };
      }

      const status = response.response.status;

      // 4xx errors: client error, don't retry (drop the events)
      if (status >= 400 && status < 500) {
        if (__DEV__) {
          console.warn('[Analytics] Client error, dropping events:', status, response.error);
        }
        return { success: false, shouldRetry: false };
      }

      // 5xx errors: server error, should retry
      if (__DEV__) {
        console.error('[Analytics] Server error, will retry:', status);
        console.error('[Analytics] Response:', response.error);
      }
      return { success: false, shouldRetry: true };
    } catch (error) {
      // Network error: should retry
      if (__DEV__) {
        console.warn('[Analytics] Network error, will retry:', error);
      }
      return { success: false, shouldRetry: true };
    }
  },
};
