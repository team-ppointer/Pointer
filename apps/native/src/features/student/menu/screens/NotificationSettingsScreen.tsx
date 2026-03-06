import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, Linking, AppState } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useQueryClient } from '@tanstack/react-query';
import { Container } from '@components/common';
import { ScreenLayout, SettingsToggleItem } from '../components';
import { usePutAllowPush, useGetPushSetting } from '@apis';
import { TanstackQueryClient } from '@/apis/client';
import { showToast } from '@features/student/scrap/components/Notification';

const checkOsNotificationPermission = async (): Promise<boolean> => {
  const status = await messaging().hasPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
};

type PushSettingsPayload = {
  isAllowPush: boolean;
  isAllowServicePush: boolean;
  isAllowQnaPush: boolean;
  isAllowMarketingPush: boolean;
};

const NotificationSettingsScreen = () => {
  const queryClient = useQueryClient();
  const { data: pushSettingData } = useGetPushSetting({ enabled: true });
  const { mutate: updatePushSettings } = usePutAllowPush();

  const [osPermissionGranted, setOsPermissionGranted] = useState(false);
  const isInitialCheckRef = useRef(true);
  const wasOsPermissionGrantedRef = useRef(false);
  const hasInitializedSubTogglesRef = useRef(false);

  const [_pushEnabled, setPushEnabled] = useState<boolean | undefined>(undefined);
  const [_serviceNotification, setServiceNotification] = useState<boolean | undefined>(undefined);
  const [_qnaNotification, setQnaNotification] = useState<boolean | undefined>(undefined);
  const [_eventNotification, setEventNotification] = useState<boolean | undefined>(undefined);

  const pushEnabled = _pushEnabled ?? pushSettingData?.isAllowPush ?? false;
  const serviceNotification = _serviceNotification ?? pushSettingData?.isAllowServicePush ?? false;
  const qnaNotification = _qnaNotification ?? pushSettingData?.isAllowQnaPush ?? false;
  const eventNotification = _eventNotification ?? pushSettingData?.isAllowMarketingPush ?? false;

  const getCurrentSettings = useCallback(
    (): PushSettingsPayload => ({
      isAllowPush: pushEnabled,
      isAllowServicePush: serviceNotification,
      isAllowQnaPush: qnaNotification,
      isAllowMarketingPush: eventNotification,
    }),
    [pushEnabled, serviceNotification, qnaNotification, eventNotification]
  );

  const applyLocalSettings = useCallback((settings: PushSettingsPayload) => {
    setPushEnabled(settings.isAllowPush);
    setServiceNotification(settings.isAllowServicePush);
    setQnaNotification(settings.isAllowQnaPush);
    setEventNotification(settings.isAllowMarketingPush);
  }, []);

  const saveSettings = useCallback(
    (nextSettings: PushSettingsPayload, previousSettings?: PushSettingsPayload) => {
      updatePushSettings(nextSettings, {
        onSuccess: () => {
          showToast('success', '알림 설정이 변경되었습니다.');
          void queryClient.invalidateQueries({
            queryKey: TanstackQueryClient.queryOptions('get', '/api/student/me/push/settings').queryKey,
          });
        },
        onError: () => {
          if (previousSettings) {
            applyLocalSettings(previousSettings);
          }
          showToast('error', '알림 설정 변경에 실패했습니다. 다시 시도해주세요.');
        },
      });
    },
    [updatePushSettings, queryClient, applyLocalSettings]
  );

  useEffect(() => {
    if (!pushSettingData) return;

    if (
      !!pushSettingData.isAllowPush ||
      !!pushSettingData.isAllowServicePush ||
      !!pushSettingData.isAllowQnaPush ||
      !!pushSettingData.isAllowMarketingPush
    ) {
      hasInitializedSubTogglesRef.current = true;
    }
  }, [pushSettingData]);

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
        const previousSettings = getCurrentSettings();
        const nextSettings: PushSettingsPayload = {
          isAllowPush: true,
          isAllowServicePush: true,
          isAllowQnaPush: true,
          isAllowMarketingPush: true,
        };

        hasInitializedSubTogglesRef.current = true;
        applyLocalSettings(nextSettings);
        saveSettings(nextSettings, previousSettings);
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
  }, [getCurrentSettings, applyLocalSettings, saveSettings]);

  const handlePushEnabledChange = (newValue: boolean) => {
    if (!osPermissionGranted) {
      // OS 알림 미허용 → 시스템 설정으로 이동 (앱 내부 상태 변경 없음)
      void Linking.openSettings();
      return;
    }

    const previousSettings = getCurrentSettings();

    let nextSettings: PushSettingsPayload = {
      ...previousSettings,
      isAllowPush: newValue,
    };

    // 최초 푸시 ON 시점에만 하위 3개를 모두 ON 처리
    if (newValue && !hasInitializedSubTogglesRef.current) {
      nextSettings = {
        ...nextSettings,
        isAllowServicePush: true,
        isAllowQnaPush: true,
        isAllowMarketingPush: true,
      };
      hasInitializedSubTogglesRef.current = true;
    }

    if (
      previousSettings.isAllowPush === nextSettings.isAllowPush &&
      previousSettings.isAllowServicePush === nextSettings.isAllowServicePush &&
      previousSettings.isAllowQnaPush === nextSettings.isAllowQnaPush &&
      previousSettings.isAllowMarketingPush === nextSettings.isAllowMarketingPush
    ) {
      return;
    }

    // OS 알림 허용됨 → 앱 내부 설정만 ON/OFF 변경
    applyLocalSettings(nextSettings);
    saveSettings(nextSettings, previousSettings);
  };

  const handleServiceNotificationChange = (newValue: boolean) => {
    const previousSettings = getCurrentSettings();
    const nextSettings = {
      ...previousSettings,
      isAllowServicePush: newValue,
    };
    applyLocalSettings(nextSettings);
    saveSettings(nextSettings, previousSettings);
  };

  const handleQnaNotificationChange = (newValue: boolean) => {
    const previousSettings = getCurrentSettings();
    const nextSettings = {
      ...previousSettings,
      isAllowQnaPush: newValue,
    };
    applyLocalSettings(nextSettings);
    saveSettings(nextSettings, previousSettings);
  };

  const handleEventNotificationChange = (newValue: boolean) => {
    const previousSettings = getCurrentSettings();
    const nextSettings = {
      ...previousSettings,
      isAllowMarketingPush: newValue,
    };
    applyLocalSettings(nextSettings);
    saveSettings(nextSettings, previousSettings);
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
