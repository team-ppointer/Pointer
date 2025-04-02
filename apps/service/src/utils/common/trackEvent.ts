'use client';

import { sendGAEvent } from '@next/third-parties/google';

export const trackEvent = (name: string, params?: Record<string, string | number | boolean>) => {
  sendGAEvent('event', name, {
    ...params,
  });
};
