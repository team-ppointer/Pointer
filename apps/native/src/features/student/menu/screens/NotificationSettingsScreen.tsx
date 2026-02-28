import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Linking, AppState } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { Container } from '@components/common';
import { ScreenLayout, SettingsToggleItem } from '../components';
import { usePutAllowPush, useGetPushSetting } from '@apis';
import { showToast } from '@features/student/scrap/components/Notification';

const checkOsNotificationPermission = async (): Promise<boolean> => {
  const status = await messaging().hasPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
};

const NotificationSettingsScreen = () => {
  const { data: pushSettingData } = useGetPushSetting({ enabled: true });
  const { mutate: updatePushSettings } = usePutAllowPush();

  const [osPermissionGranted, setOsPermissionGranted] = useState(false);
  const isInitialCheckRef = useRef(true);
  const wasOsPermissionGrantedRef = useRef(false);

  const [_pushEnabled, setPushEnabled] = useState<boolean | undefined>(undefined);
  const [_serviceNotification, setServiceNotification] = useState<boolean | undefined>(undefined);
  const [_qnaNotification, setQnaNotification] = useState<boolean | undefined>(undefined);
  const [_eventNotification, setEventNotification] = useState<boolean | undefined>(undefined);

  const pushEnabled = _pushEnabled ?? pushSettingData?.isAllowPush ?? false;
  const serviceNotification = _serviceNotification ?? pushSettingData?.isAllowServicePush ?? false;
  const qnaNotification = _qnaNotification ?? pushSettingData?.isAllowQnaPush ?? false;
  const eventNotification = _eventNotification ?? pushSettingData?.isAllowMarketingPush ?? false;

  useEffect(() => {
    const syncPermission = async () => {
      const granted = await checkOsNotificationPermission();
      const wasGranted = wasOsPermissionGrantedRef.current;
      wasOsPermissionGrantedRef.current = granted;
      setOsPermissionGranted(granted);

      // 초기 확인이 아닌 경우에만 "새로 허용됨" 판단
      // (초기 로드 시 이미 허용돼 있어도 전체 ON 처리하지 않음)
      if (!isInitialCheckRef.current && !wasGranted && granted) {
        // 시스템 설정에서 알림을 허용하고 돌아온 경우 → 모든 토글 ON
        setPushEnabled(true);
        setServiceNotification(true);
        setQnaNotification(true);
        setEventNotification(true);
        updatePushSettings({
          isAllowPush: true,
          isAllowServicePush: true,
          isAllowQnaPush: true,
          isAllowMarketingPush: true,
        });
        showToast('success', '알림 설정이 변경되었습니다.');
      }

      isInitialCheckRef.current = false;
    };

    void syncPermission();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncPermission();
      }
    });

    return () => subscription.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = (
    isAllowPush: boolean,
    isAllowServicePush: boolean,
    isAllowQnaPush: boolean,
    isAllowMarketingPush: boolean
  ) => {
    updatePushSettings({
      isAllowPush,
      isAllowServicePush,
      isAllowQnaPush,
      isAllowMarketingPush,
    });
    showToast('success', '알림 설정이 변경되었습니다.');
  };

  const handlePushEnabledChange = (newValue: boolean) => {
    if (!osPermissionGranted) {
      // OS 알림 미허용 → 시스템 설정으로 이동 (앱 내부 상태 변경 없음)
      void Linking.openSettings();
      return;
    }
    // OS 알림 허용됨 → 앱 내부 설정만 ON/OFF 변경
    setPushEnabled(newValue);
    handleSave(newValue, serviceNotification, qnaNotification, eventNotification);
  };

  const handleServiceNotificationChange = (newValue: boolean) => {
    setServiceNotification(newValue);
    handleSave(pushEnabled, newValue, qnaNotification, eventNotification);
  };

  const handleQnaNotificationChange = (newValue: boolean) => {
    setQnaNotification(newValue);
    handleSave(pushEnabled, serviceNotification, newValue, eventNotification);
  };

  const handleEventNotificationChange = (newValue: boolean) => {
    setEventNotification(newValue);
    handleSave(pushEnabled, serviceNotification, qnaNotification, newValue);
  };

  return (
    <ScreenLayout title='알림 설정'>
      <ScrollView className='flex-1 pt-[10px]' showsVerticalScrollIndicator={false}>
        <Container className='gap-[16px]'>
          <SettingsToggleItem
            title='푸시 알림'
            value={pushEnabled}
            onValueChange={handlePushEnabledChange}
          />

          <View className='h-[1px] w-full bg-gray-400' />

          <SettingsToggleItem
            title='서비스 알림'
            description='학습 안내, 문항 등록 안내 등'
            value={serviceNotification}
            onValueChange={handleServiceNotificationChange}
            disabled={!pushEnabled}
          />

          <SettingsToggleItem
            title='QnA 채팅 알림'
            description='출제진 피드백, 선생님 답변 알림 등'
            value={qnaNotification}
            onValueChange={handleQnaNotificationChange}
            disabled={!pushEnabled}
          />

          <SettingsToggleItem
            title='이벤트/업데이트 알림'
            description='이벤트 및 업데이트 관련 마케팅 알림 등'
            value={eventNotification}
            onValueChange={handleEventNotificationChange}
            disabled={!pushEnabled}
          />
        </Container>
      </ScrollView>
    </ScreenLayout>
  );
};

export default NotificationSettingsScreen;
