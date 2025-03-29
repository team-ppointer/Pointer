'use client';

import { sendGAEvent } from '@next/third-parties/google';

export const trackEvent = (name: string, params?: Record<string, string | number | boolean>) => {
  sendGAEvent('event', name, params || {});
};

export const trackPageView = (path: string) => {
  sendGAEvent('config', 'G-7C9ETDHB0G', {
    page_path: path,
  });
};
