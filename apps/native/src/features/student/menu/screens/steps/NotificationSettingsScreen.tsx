import React, { useState } from 'react';
import { View, Text, Pressable, Switch, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container } from '@components/common';
import { ChevronLeft } from 'lucide-react-native';
import { MenuStackParamList } from '../../MenuNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [serviceNotification, setServiceNotification] = useState(true);
  const [qnaNotification, setQnaNotification] = useState(true);
  const [eventNotification, setEventNotification] = useState(false);

  const handleSave = () => {
    console.log('Save notification settings:', {
      pushEnabled,
      serviceNotification,
      qnaNotification,
      eventNotification,
    });
    navigation.goBack();
  };

  return (
    <View className='w-full flex-1'>
      <SafeAreaView edges={['top']} className='flex-row items-center justify-between px-5 py-1'>
        <Pressable onPress={() => navigation.goBack()} className='p-2'>
          <ChevronLeft size={24} color='#000' />
        </Pressable>
        <Text className='text-20b text-black'>알림 설정</Text>
        <View />
      </SafeAreaView>

      <ScrollView className='flex-1 pt-[10px]' showsVerticalScrollIndicator={false}>
        <Container className='gap-4'>
          <View className='flex-row items-center justify-between py-2'>
            <View className='flex-1'>
              <Text className='text-18sb text-black'>푸시 알림</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
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
                onValueChange={setServiceNotification}
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
                onValueChange={setQnaNotification}
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
                onValueChange={setEventNotification}
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
