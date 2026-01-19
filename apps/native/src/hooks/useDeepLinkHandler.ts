import { useEffect, useRef, useCallback } from 'react';
import { Platform, Alert, Dimensions } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { CommonActions } from '@react-navigation/native';
import { navigationRef, isNavigationReady } from '@/services/navigation';
import { parseDeepLinkUrl, isValidDeepLink } from '@/utils/deepLink';
import { getPublishDetailById } from '@/apis/controller/student/study';
import { useProblemSessionStore } from '@/stores';

type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

const TABLET_BREAKPOINT = 768;

/**
 * 현재 화면이 태블릿 크기인지 확인합니다.
 */
const isTabletScreen = () => {
  const { width } = Dimensions.get('window');
  return width >= TABLET_BREAKPOINT;
};

/**
 * 딥링크를 처리하고 적절한 화면으로 네비게이션합니다.
 */
const handleDeepLink = async (url: string | undefined | null) => {
  const parsed = parseDeepLinkUrl(url);

  if (!isValidDeepLink(parsed)) {
    console.log('[DeepLink] Invalid or unknown deep link:', url);
    return false;
  }

  // 네비게이션이 준비될 때까지 대기 (최대 3초)
  const waitForNavigation = async (timeout = 3000): Promise<boolean> => {
    const startTime = Date.now();
    while (!isNavigationReady() && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return isNavigationReady();
  };

  const isReady = await waitForNavigation();
  if (!isReady) {
    console.warn('[DeepLink] Navigation not ready, cannot handle deep link');
    return false;
  }

  console.log('[DeepLink] Handling deep link:', parsed);

  try {
    if (parsed.type === 'qna' && parsed.id) {
      const isTablet = isTabletScreen();
      
      if (isTablet) {
        // 태블릿: Qna 탭으로 이동하면서 initialChatRoomId 전달
        navigationRef.dispatch(
          CommonActions.navigate({
            name: 'StudentApp',
            params: {
              screen: 'StudentTabs',
              params: {
                screen: 'Qna',
                params: { initialChatRoomId: parsed.id },
              },
            },
          })
        );
      } else {
        // 모바일: ChatRoom 화면으로 직접 이동
        navigationRef.dispatch(
          CommonActions.navigate({
            name: 'StudentApp',
            params: {
              screen: 'ChatRoom',
              params: { chatRoomId: parsed.id },
            },
          })
        );
      }
      return true;
    }

    if (parsed.type === 'publish' && parsed.id) {
      // 문제 풀이 화면으로 이동
      const publishDetail = await getPublishDetailById(parsed.id);

      if (!publishDetail) {
        Alert.alert('알림', '해당 문제를 찾을 수 없습니다.');
        return false;
      }

      const groups = publishDetail.data ?? [];
      // 첫 번째 미완료 문제 찾기 (DOING 또는 NONE 상태), 없으면 첫 번째 문제
      const targetGroup =
        groups.find((group) => group.progress !== 'DONE') ?? groups[0];

      if (!targetGroup) {
        Alert.alert('알림', '진행할 문제가 없습니다.');
        return false;
      }

      // 문제 세션 시작
      const startSession = useProblemSessionStore.getState().init;
      startSession(targetGroup, {
        publishId: parsed.id,
        publishAt: publishDetail.publishAt,
      });

      // Problem 화면으로 이동
      navigationRef.dispatch(
        CommonActions.navigate({
          name: 'StudentApp',
          params: {
            screen: 'Problem',
          },
        })
      );
      return true;
    }
  } catch (error) {
    console.error('[DeepLink] Error handling deep link:', error);
    return false;
  }

  return false;
};

/**
 * FCM 알림과 딥링크를 처리하는 훅
 * 
 * - 앱이 백그라운드/종료 상태에서 알림을 탭했을 때 딥링크 처리
 * - 앱이 포그라운드에서 알림을 탭했을 때 딥링크 처리
 */
const useDeepLinkHandler = () => {
  const isHandlingInitialNotification = useRef(false);

  // FCM 초기 알림 처리 (앱이 종료 상태에서 알림 탭으로 열릴 때)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handleInitialNotification = async () => {
      if (isHandlingInitialNotification.current) return;
      isHandlingInitialNotification.current = true;

      try {
        // 앱이 종료 상태에서 알림으로 열린 경우
        const initialNotification = await messaging().getInitialNotification();
        if (initialNotification?.data?.url) {
          console.log('[DeepLink] Initial notification:', initialNotification);
          await handleDeepLink(initialNotification.data.url as string);
        }
      } catch (error) {
        console.error('[DeepLink] Error handling initial notification:', error);
      }
    };

    void handleInitialNotification();
  }, []);

  // FCM 백그라운드 알림 탭 처리
  useEffect(() => {
    if (Platform.OS === 'web') return;

    // 앱이 백그라운드에서 알림 탭으로 포그라운드로 올 때
    const unsubscribe = messaging().onNotificationOpenedApp(
      async (remoteMessage: RemoteMessage) => {
        console.log('[DeepLink] Notification opened app:', remoteMessage);
        if (remoteMessage.data?.url) {
          await handleDeepLink(remoteMessage.data.url as string);
        }
      }
    );

    return unsubscribe;
  }, []);

  // Expo Notifications 응답 처리 (포그라운드에서 알림 탭)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log('[DeepLink] Notification response received:', response);
        const url = response.notification.request.content.data?.url;
        if (url) {
          await handleDeepLink(url as string);
        }
      }
    );

    return () => subscription.remove();
  }, []);
};

export { handleDeepLink };
export default useDeepLinkHandler;
