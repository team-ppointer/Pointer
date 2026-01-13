import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Container } from '@components/common';
import { ScreenLayout, SettingsToggleItem } from '../components';
import { usePutAllowPush, useGetPushSetting } from '@/apis/controller/student/me';
import { showToast } from '@/features/student/scrap/components/Notification';

const NotificationSettingsScreen = () => {
  const { data: pushSettingData } = useGetPushSetting({ enabled: true });
  const { mutate: updatePushSettings } = usePutAllowPush();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [serviceNotification, setServiceNotification] = useState(false);
  const [qnaNotification, setQnaNotification] = useState(false);
  const [eventNotification, setEventNotification] = useState(false);

  useEffect(() => {
    if (pushSettingData) {
      setPushEnabled(pushSettingData.isAllowPush ?? false);
      setServiceNotification(pushSettingData.isAllowServicePush ?? false);
      setQnaNotification(pushSettingData.isAllowQnaPush ?? false);
      setEventNotification(pushSettingData.isAllowMarketingPush ?? false);
    }
  }, [pushSettingData]);

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

          <View className='w-full h-[1px] bg-gray-400' />

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
