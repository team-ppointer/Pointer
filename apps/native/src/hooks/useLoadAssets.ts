import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { hydrateAuthState } from '@utils';
import { useAuthStore } from '@stores';
import { useSignupStore } from '@features/auth/signup/store/useSignupStore';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';

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
        // Zustand persist 스토어 hydration 대기
        await Promise.all([
          new Promise<void>((resolve) => {
            if (useSignupStore.persist.hasHydrated()) {
              resolve();
            } else {
              useSignupStore.persist.onFinishHydration(() => resolve());
            }
          }),
          new Promise<void>((resolve) => {
            if (useOnboardingStore.persist.hasHydrated()) {
              resolve();
            } else {
              useOnboardingStore.persist.onFinishHydration(() => resolve());
            }
          }),
        ]);

        await hydrateAuthState();
        await useAuthStore.getState().hydrateFromStorage();
        await useAuthStore.getState().verifySession();

        // STEP 1 미완료 상태에서 앱 재시작 시 → 로그아웃 처리 (로그인 화면에서 시작)
        const onboardingStatus = useOnboardingStore.getState().status;
        const step1Completed = useSignupStore.getState().step1Completed;
        const sessionStatus = useAuthStore.getState().sessionStatus;

        if (
          sessionStatus === 'authenticated' &&
          onboardingStatus === 'in-progress' &&
          !step1Completed
        ) {
          await useAuthStore.getState().signOut();
        }
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
