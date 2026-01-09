import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { postPushToken } from '@apis/controller/student/me';

/**
 * FCM 토큰을 가져와서 서버에 등록/갱신하는 훅
 * - iOS/Android에서만 동작 (웹에서는 동작하지 않음)
 * - 컴포넌트 마운트 시 한 번만 실행됨
 */
const useFcmToken = () => {
  const hasRegistered = useRef(false);

  useEffect(() => {
    // 웹에서는 FCM을 사용하지 않음
    if (Platform.OS === 'web') {
      return;
    }

    // 이미 등록한 경우 다시 등록하지 않음
    if (hasRegistered.current) {
      return;
    }

    const registerFcmToken = async () => {
      try {
        // 동적 import로 react-native-firebase/messaging 가져오기
        // (웹에서 번들링 시 에러 방지)
        const messaging = (await import('@react-native-firebase/messaging')).default;

        // 권한 요청 (iOS 필수, Android도 권장)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('[FCM] Push notification permission not granted');
          return;
        }

        // FCM 토큰 가져오기
        const token = await messaging().getToken();

        if (!token) {
          console.warn('[FCM] Failed to get FCM token');
          return;
        }

        // 서버에 토큰 등록
        await postPushToken(token);

        hasRegistered.current = true;
        console.log('[FCM] FCM token registered successfully');
      } catch (error) {
        console.error('[FCM] Error during FCM token registration:', error);
      }
    };

    void registerFcmToken();
  }, []);
};

export default useFcmToken;
