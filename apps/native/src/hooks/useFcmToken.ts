import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { postPushToken } from '@apis/controller/student/me';

// 알림 수신 시 동작 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
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

    // 이미 등록한 경우 다시 등록하지 않음
    if (hasRegistered.current) {
      return;
    }

    const registerFcmToken = async () => {
      try {
        // 실제 디바이스인지 확인 (시뮬레이터에서는 푸시 알림 불가)
        if (!Device.isDevice) {
          console.warn('[FCM] Must use physical device for push notifications');
          return;
        }

        // 권한 요청
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.warn('[FCM] Push notification permission not granted');
          return;
        }

        // Android 알림 채널 설정
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        // 네이티브 FCM/APNs 토큰 가져오기 (Expo Push Token이 아님!)
        const tokenData = await Notifications.getDevicePushTokenAsync();
        const token = tokenData.data;

        if (!token) {
          console.warn('[FCM] Failed to get device push token');
          return;
        }

        // 서버에 토큰 등록
        await postPushToken(token);

        hasRegistered.current = true;
        console.log('[FCM] Device push token registered successfully');
      } catch (error) {
        console.error('[FCM] Error during token registration:', error);
      }
    };

    void registerFcmToken();

    // 포그라운드에서 알림 수신 리스너
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log('[FCM] Notification received:', notification);
      }
    );

    // 알림 탭 리스너 (사용자가 알림을 탭했을 때)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        console.log('[FCM] Notification response:', response);
        // 여기서 알림 탭에 따른 네비게이션 등 처리 가능
      }
    );

    // 클린업
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
};

export default useFcmToken;
