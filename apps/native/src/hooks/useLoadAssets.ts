import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { hydrateAuthState } from '@utils';
import { useAuthStore } from '@stores';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync().catch(() => {
  // no-op if already prevented
});

const useLoadAssets = () => {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Pretendard: require('@assets/fonts/PretendardVariable.ttf'),
  });

  useEffect(() => {
    let isMounted = true;

    const prepare = async () => {
      try {
        await Promise.all([hydrateAuthState()]);
        await useAuthStore.getState().hydrateFromStorage();
      } catch (error) {
        console.error('Failed to load assets', error);
      } finally {
        if (!isMounted) {
          return;
        }

        if (fontsLoaded) {
          setIsReady(true);
        }
      }
    };

    if (fontsLoaded) {
      prepare();
    }

    return () => {
      isMounted = false;
    };
  }, [fontsLoaded]);

  return { isReady, fontsLoaded, loading: !isReady || !fontsLoaded };
};

export default useLoadAssets;
