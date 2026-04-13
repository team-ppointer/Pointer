import { useSyncExternalStore } from 'react';

import { pointingFeedbackQueue, type PointingQueueEntry } from '../services';

/** Stable snapshot of the pending feedback queue for React subscribers. */
export function usePointingQueueSnapshot(): PointingQueueEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

let cached: PointingQueueEntry[] = pointingFeedbackQueue.snapshot();

function subscribe(callback: () => void): () => void {
  return pointingFeedbackQueue.subscribe(() => {
    const fresh = pointingFeedbackQueue.snapshot();
    if (!entriesEqual(cached, fresh)) {
      cached = fresh;
    }
    callback();
  });
}

function getSnapshot(): PointingQueueEntry[] {
  return cached;
}

function entriesEqual(a: PointingQueueEntry[], b: PointingQueueEntry[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ea = a[i];
    const eb = b[i];
    if (ea.key !== eb.key || ea.value !== eb.value || ea.attempt !== eb.attempt) {
      return false;
    }
  }
  return true;
}
