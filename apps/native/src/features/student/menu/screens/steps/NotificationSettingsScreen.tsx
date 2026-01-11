import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container } from '@components/common';
import { ChevronLeft } from 'lucide-react-native';
import { MenuStackParamList } from '../../MenuNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';
import { usePutAllowPush, useGetPushSetting } from '@/apis/controller/student/me';
import { showToast } from '@/features/student/scrap/components/Notification';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();

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

  return (
    <View className='w-full flex-1'>
      <SafeAreaView edges={['top']} className='flex-row items-center justify-between px-5 py-1'>
        <Pressable onPress={() => navigation.goBack()} className='p-2'>
          <ChevronLeft size={32} color='#000' />
        </Pressable>
        <Text className='text-20b text-black'>알림 설정</Text>
        <View className='w-10' />
      </SafeAreaView>

      <ScrollView className='flex-1 pt-[10px]' showsVerticalScrollIndicator={false}>
        <Container className='gap-4'>
          <View className='flex-row items-center justify-between py-2'>
            <View className='flex-1'>
              <Text className='text-18sb text-black'>푸시 알림</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={(newValue) => {
                setPushEnabled(newValue);
                handleSave(
                  newValue,
                  serviceNotification ?? false,
                  qnaNotification ?? false,
                  eventNotification ?? false
                );
              }}
              trackColor={{ false: colors['gray-400'], true: colors['blue-500'] }}
              thumbColor={pushEnabled ? '#FFF' : '#F3F4F6'}
            />
          </View>

          <View className='w-full border-[1px] border-gray-400' />

          <View className='gap-4'>
            <View className='flex-row items-center justify-between py-2'>
              <View className='flex-1 gap-0.5'>
                <Text className='text-18m text-black'>서비스 알림</Text>
                <Text className='text-14r text-gray-700'>학습 안내, 문항 등록 안내 등</Text>
              </View>
              <Switch
                value={serviceNotification}
                onValueChange={(newValue) => {
                  setServiceNotification(newValue);
                  handleSave(
                    pushEnabled ?? false,
                    newValue ?? false,
                    qnaNotification ?? false,
                    eventNotification ?? false
                  );
                }}
                disabled={!pushEnabled}
                trackColor={{ false: colors['gray-400'], true: colors['blue-500'] }}
                thumbColor={serviceNotification ? '#FFF' : '#F3F4F6'}
              />
            </View>

            <View className='flex-row items-center justify-between py-2'>
              <View className='flex-1 gap-0.5'>
                <Text className='text-18m text-black'>QnA 채팅 알림</Text>
                <Text className='text-14r text-gray-700'>출제진 피드백, 선생님 답변 알림 등</Text>
              </View>
              <Switch
                value={qnaNotification}
                onValueChange={(newValue) => {
                  setQnaNotification(newValue);
                  handleSave(
                    pushEnabled ?? false,
                    serviceNotification ?? false,
                    newValue ?? false,
                    eventNotification ?? false
                  );
                }}
                disabled={!pushEnabled}
                trackColor={{ false: colors['gray-400'], true: colors['blue-500'] }}
                thumbColor={qnaNotification ? '#FFF' : '#F3F4F6'}
              />
            </View>

            <View className='flex-row items-center justify-between py-2'>
              <View className='flex-1 gap-0.5'>
                <Text className='text-18m text-black'>이벤트/업데이트 알림</Text>
                <Text className='text-14r text-gray-700'>
                  이벤트 및 업데이트 관련 마케팅 알림 등
                </Text>
              </View>
              <Switch
                value={eventNotification}
                onValueChange={(newValue) => {
                  setEventNotification(newValue);
                  handleSave(
                    pushEnabled ?? false,
                    serviceNotification ?? false,
                    qnaNotification ?? false,
                    newValue ?? false
                  );
                }}
                disabled={!pushEnabled}
                trackColor={{ false: colors['gray-400'], true: colors['blue-500'] }}
                thumbColor={eventNotification ? '#FFF' : '#F3F4F6'}
              />
            </View>
          </View>
        </Container>
      </ScrollView>
    </View>
  );
};

export default NotificationSettingsScreen;
