import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell } from 'lucide-react-native';

import { AlertBellButtonIcon } from '@components/system/icons';
import { AnimatedPressable, ContentInset } from '@components/common';
import { useGetNotificationCount } from '@/apis/controller/student/notification';
import { useGetNoticeCount } from '@/apis/controller/student/notice';

import { type StudentRootStackParamList } from '../types';

type RootNav = NativeStackNavigationProp<StudentRootStackParamList>;

const HomeHeader = () => {
  const navigation = useNavigation<RootNav>();
  const { data: notificationCountData } = useGetNotificationCount({});
  const { data: noticeCountData } = useGetNoticeCount();

  const hasUnread =
    (notificationCountData?.unreadCount ?? 0) >= 1 || (noticeCountData?.unreadCount ?? 0) >= 1;

  return (
    <View>
      <ContentInset className='flex-row items-center justify-end py-[4px]'>
        <AnimatedPressable
          onPress={() => navigation.navigate('Notifications')}
          className='size-[48px] items-center justify-center gap-[10px] rounded-[8px] px-[3px] py-[9px]'>
          {hasUnread ? <AlertBellButtonIcon /> : <Bell size={24} color='black' />}
        </AnimatedPressable>
      </ContentInset>
    </View>
  );
};

export default HomeHeader;
