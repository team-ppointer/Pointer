import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsClient } from './client';
import type { AnalyticsEvent, DeviceType } from './types';

const STORAGE_KEY = '@analytics_queue';
const MAX_BATCH_SIZE = 100;
const FLUSH_THRESHOLD = 10;
const FLUSH_INTERVAL_MS = 30000; // 30 seconds

/**
 * Analytics event queue with batching, persistence, and retry logic
 */
class AnalyticsQueue {
  private queue: AnalyticsEvent[] = [];
  private inflight: AnalyticsEvent[] = [];
  private flushLock = false;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string = '';
  private deviceType: DeviceType = 'UNKNOWN';

  /**
   * Initialize the queue - restore persisted events and start flush timer
   */
  async init(sessionId: string, deviceType: DeviceType): Promise<void> {
    this.sessionId = sessionId;
    this.deviceType = deviceType;

    // Restore persisted queue
    await this.restore();

    // Start periodic flush
    this.startFlushTimer();
  }

  /**
   * Add event to queue
   */
  async enqueue(event: AnalyticsEvent): Promise<void> {
    this.queue.push(event);

    if (__DEV__) {
      console.log(
        '[Analytics] 📥 Event enqueued:',
        event.eventType,
        JSON.stringify(event.metadata, null, 2)
      );
      console.log('[Analytics] 📊 Queue size:', this.queue.length, '| Threshold:', FLUSH_THRESHOLD);
    }

    // Persist immediately
    await this.persist();

    // Auto-flush if threshold reached
    if (this.queue.length >= FLUSH_THRESHOLD) {
      if (__DEV__) {
        console.log('[Analytics] 🔔 Threshold reached, triggering flush...');
      }
      this.flush();
    }
  }

  /**
   * Flush pending events to server
   */
  async flush(): Promise<void> {
    // Prevent concurrent flushes
    if (this.flushLock) {
      if (__DEV__) {
        console.log('[Analytics] ⏳ Flush already in progress, skipping...');
      }
      return;
    }

    // Nothing to flush
    if (this.queue.length === 0 && this.inflight.length === 0) {
      if (__DEV__) {
        console.log('[Analytics] 📭 Nothing to flush (queue empty)');
      }
      return;
    }

    this.flushLock = true;

    if (__DEV__) {
      console.log('[Analytics] 🚀 Starting flush...');
      console.log('[Analytics] 📋 Queue before flush:', this.queue.length, 'events');
      console.log('[Analytics] ✈️  Inflight before flush:', this.inflight.length, 'events');
    }

    try {
      // If there are inflight events from a previous failed attempt, retry those first
      if (this.inflight.length > 0) {
        if (__DEV__) {
          console.log('[Analytics] 🔄 Retrying inflight events:', this.inflight.length);
        }

        const result = await analyticsClient.sendEvents({
          events: this.inflight,
          sessionId: this.sessionId,
          deviceType: this.deviceType,
        });

        if (result.success) {
          if (__DEV__) {
            console.log('[Analytics] ✅ Inflight retry successful');
          }
          this.inflight = [];
        } else if (!result.shouldRetry) {
          // Drop events on client error
          if (__DEV__) {
            console.log('[Analytics] ❌ Inflight dropped (client error)');
          }
          this.inflight = [];
        } else {
          if (__DEV__) {
            console.log('[Analytics] ⚠️  Inflight retry failed, will retry later');
          }
        }
        // If shouldRetry, keep inflight for next attempt
      }

      // Process queue in batches
      while (this.queue.length > 0 && this.inflight.length === 0) {
        // Take a batch from the queue
        const batch = this.queue.splice(0, MAX_BATCH_SIZE);
        this.inflight = batch;

        if (__DEV__) {
          console.log('[Analytics] 📤 Sending batch:', batch.length, 'events');
          console.log(
            '[Analytics] 📝 Events in batch:',
            batch.map((e) => `${e.eventType}(${JSON.stringify(e.metadata)})`).join(', ')
          );
        }

        const result = await analyticsClient.sendEvents({
          events: batch,
          sessionId: this.sessionId,
          deviceType: this.deviceType,
        });

        if (result.success) {
          if (__DEV__) {
            console.log('[Analytics] ✅ Batch sent successfully');
          }
          this.inflight = [];
        } else if (result.shouldRetry) {
          // Put back at front of queue for retry
          if (__DEV__) {
            console.log('[Analytics] ⚠️  Batch failed, returning to queue for retry');
          }
          this.queue.unshift(...this.inflight);
          this.inflight = [];
          break; // Stop processing, will retry on next flush
        } else {
          // Drop events on client error
          if (__DEV__) {
            console.log('[Analytics] ❌ Batch dropped (client error)');
          }
          this.inflight = [];
        }
      }

      // Persist updated state
      await this.persist();

      if (__DEV__) {
        console.log('[Analytics] 📋 Queue after flush:', this.queue.length, 'events');
        console.log('[Analytics] ✈️  Inflight after flush:', this.inflight.length, 'events');
        console.log('[Analytics] 🏁 Flush complete');
      }
    } finally {
      this.flushLock = false;
    }
  }

  /**
   * Stop the flush timer (call on app termination)
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Get current queue length (for debugging)
   */
  get length(): number {
    return this.queue.length + this.inflight.length;
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, FLUSH_INTERVAL_MS);
  }

  private async persist(): Promise<void> {
    try {
      const data = JSON.stringify([...this.inflight, ...this.queue]);
      await AsyncStorage.setItem(STORAGE_KEY, data);
    } catch (error) {
      if (__DEV__) {
        console.warn('[Analytics] Failed to persist queue:', error);
      }
    }
  }

  private async restore(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const events = JSON.parse(data) as AnalyticsEvent[];
        this.queue = events;
        if (__DEV__) {
          console.log('[Analytics] Restored', events.length, 'events from storage');
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[Analytics] Failed to restore queue:', error);
      }
    }
  }
}

export const analyticsQueue = new AnalyticsQueue();
