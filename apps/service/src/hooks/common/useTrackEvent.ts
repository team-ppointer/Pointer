'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { usePathname } from 'next/navigation';

const useTrackEvent = () => {
  const pathname = usePathname();
  const trackEvent = (name: string, params?: Record<string, string | number | boolean>) => {
    sendGAEvent('event', name, {
      pathname,
      ...params,
    });
  };

  return { trackEvent };
};

export default useTrackEvent;
