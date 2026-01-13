import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container, NotificationItem } from '@components/common';
import { ScreenLayout } from '../components';
import { putReadNotice, useGetNotice } from '@/apis/controller/student/notice';
import {
  useGetNotification,
  useGetNotificationCount,
  usePostReadAllNotification,
  usePostReadNotification,
} from '@/apis/controller/student/notification';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useQueryClient } from '@tanstack/react-query';
import { TanstackQueryClient } from '@/apis/client';
import useInvalidateNotificationData from '@/apis/controller/student/notification/useIncalidateNotificationData';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `오늘 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const getNotificationIcon = (type: string): 'megaphone' | 'message' | 'book' => {
  switch (type) {
    case 'QNA':
      return 'message';
    case 'ASSIGNMENT':
      return 'book';
    default:
      return 'megaphone';
  }
};

const NoticeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const queryClient = useQueryClient();

  const { data: noticeData } = useGetNotice();
  const { data: notificationData } = useGetNotification({ dayLimit: 7 });
  const { data: notificationCountData } = useGetNotificationCount({});
  const { invalidateAll } = useInvalidateNotificationData();

  const invalidateNoticeData = () => {
    queryClient.invalidateQueries({
      queryKey: TanstackQueryClient.queryOptions('get', '/api/student/notice', {}).queryKey,
    });
    queryClient.invalidateQueries({
      queryKey: TanstackQueryClient.queryOptions('get', '/api/student/notice/count', {}).queryKey,
    });
  };

  const { mutate: readAllNotifications } = usePostReadAllNotification({
    onSuccess: () => {
      invalidateAll();
    },
  });

  const { mutate: readNotification } = usePostReadNotification({
    onSuccess: () => {
      invalidateAll();
    },
  });

  const notices = noticeData?.data ?? [];
  const notifications = notificationData?.data ?? [];
  const unreadNotificationCount = notificationCountData?.unreadCount ?? 0;

  const handleReadAll = () => {
    if (unreadNotificationCount >= 1) {
      readAllNotifications();
    }
  };

  return (
    <ScreenLayout title='공지사항'>
      <ScrollView>
        <View className='mx-auto w-full'>
          <Container className='gap-[10px] pt-[16px]'>
            {notices.map((notice) => (
              <NotificationItem
                key={notice.id}
                icon='megaphone'
                title={notice.title}
                time={formatDate(notice.startAt)}
                hasBadge={!notice.isRead}>
                <NotificationItem.Button
                  variant='ghost'
                  onPress={() => {
                    if (!notice.isRead) {
                      putReadNotice(notice.id).then(() => {
                        invalidateNoticeData();
                      });
                    }
                    navigation.push('NotificationDetail', {
                      noticeId: notice.id,
                      title: notice.title,
                      date: notice.startAt,
                      content: notice.content,
                    });
                  }}>
                  더보기
                </NotificationItem.Button>
              </NotificationItem>
            ))}
            {notices.length === 0 && (
              <View className='flex-col items-center gap-[10px] py-[30px]'>
                <Text className='text-14m text-gray-600'>공지사항이 없어요.</Text>
              </View>
            )}
          </Container>
        </View>
        <Container className='flex-1 items-center justify-center gap-[10px] pb-[100px] pt-[20px]'>
          <Text className='text-14m text-gray-600'>7일 전 알림까지 확인할 수 있어요.</Text>
        </Container>
      </ScrollView>
    </ScreenLayout>
  );
};

export default NoticeScreen;
