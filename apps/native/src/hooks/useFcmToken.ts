import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import messaging from '@react-native-firebase/messaging';
import { postPushToken } from '@apis/controller/student/me';

// 알림 수신 시 동작 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * FCM 토큰을 가져와서 서버에 등록/갱신하는 훅
 * - iOS/Android에서만 동작 (웹에서는 동작하지 않음)
 * - 컴포넌트 마운트 시 한 번만 실행됨
 * - expo-notifications를 사용하여 네이티브 FCM/APNs 토큰을 직접 가져옴
 */
const useFcmToken = () => {
  const hasRegistered = useRef(false);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // 웹에서는 FCM을 사용하지 않음
    if (Platform.OS === 'web') {
      return;
    }

    const registerFcmToken = async () => {
      try {
        if (!Device.isDevice) {
          console.warn('[FCM] Must use physical device for push notifications');
          return;
        }

        // 1. 권한 요청 (Firebase Native Method 사용 권장)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('[FCM] Authorization status:', authStatus);
          return;
        }

        // 2. APNs 토큰 확인 (iOS 필수: 이게 없으면 FCM 토큰이 있어도 동작 안 함)
        if (Platform.OS === 'ios') {
          const apnsToken = await messaging().getAPNSToken();
          console.log('[FCM] APNs Token:', apnsToken);
          if (!apnsToken) {
            console.error('[FCM] APNs Token is missing! Swizzling might be failed.');
            // 여기서 APNs 토큰이 없다면 iOS 설정 문제(Capabilities 등)일 가능성이 큼
          }
        }

        // 3. FCM 토큰 가져오기
        const token = await messaging().getToken();
        console.log('[FCM] Device FCM Token:', token);

        if (token && !hasRegistered.current) {
          await postPushToken(token);
          hasRegistered.current = true;
          console.log('[FCM] Token registered to server');
        }
      } catch (error) {
        console.error('[FCM] Registration failed:', error);
      }
    };

    void registerFcmToken();

    // 4. 포그라운드 메시지 수신 (앱이 켜져 있을 때 로그 확인용)
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('[FCM] A new FCM message arrived!', JSON.stringify(remoteMessage));

      // 앱이 켜져 있을 때도 상단 알림을 띄우고 싶다면 expo-notifications 사용
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || '알림',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data,
        },
        trigger: null, // 즉시 표시
      });
    });

    return unsubscribe;
  }, []);
};

export default useFcmToken;
