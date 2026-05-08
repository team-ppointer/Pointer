import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react-native';

import { AnimatedPressable, ContentInset, Header, NotificationItem } from '@components/common';
import { NoNotificationBellIcon } from '@components/system/icons';
import { type StudentRootStackParamList } from '@navigation/student/types';
import {
  useGetNotification,
  useGetNotificationCount,
  usePostReadAllNotification,
  usePostReadNotification,
} from '@apis/controller/student/notification';
import { useGetNotice, putReadNotice, useInvalidateNoticeData, getPublishDetailById } from '@apis';
import { parseDeepLinkUrl, isValidDeepLink } from '@utils/deepLink';
import { useProblemSessionStore, getInitialScreenForPhase } from '@stores';
import useInvalidateNotificationData from '@apis/controller/student/notification/useIncalidateNotificationData';
import { useIsTablet } from '@features/student/qna/hooks/useIsTablet';
import { formatNoticeDate, formatNotificationDate } from '@utils/dateFormatter';

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

const NotificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const queryClient = useQueryClient();
  const isTablet = useIsTablet();

  const { data: noticeData } = useGetNotice({ size: 2 });
  const { data: notificationData } = useGetNotification({ dayLimit: 7 });
  const { data: notificationCountData } = useGetNotificationCount({});
  const { invalidateAll: invalidateNotifications } = useInvalidateNotificationData();
  const { invalidateAll: invalidateNotices } = useInvalidateNoticeData();

  const { mutate: readAllNotifications } = usePostReadAllNotification({
    onSuccess: () => {
      invalidateNotifications();
    },
  });

  const { mutate: readNotification } = usePostReadNotification({
    onSuccess: () => {
      invalidateNotifications();
    },
  });

  const initWithResume = useProblemSessionStore((state) => state.initWithResume);

  const notices = noticeData?.data ?? [];
  const notifications = notificationData?.data ?? [];
  const unreadNotificationCount = notificationCountData?.unreadCount ?? 0;

  const handleReadAll = () => {
    if (unreadNotificationCount >= 1) {
      readAllNotifications();
    }
  };

  const handleNotificationPress = async (
    notificationId: number,
    url?: string,
    isRead?: boolean
  ) => {
    if (!isRead) {
      readNotification(notificationId);
    }

    if (!url) {
      return;
    }

    const parsed = parseDeepLinkUrl(url);

    if (!isValidDeepLink(parsed)) {
      console.log('[NotificationScreen] Unknown deep link:', url);
      return;
    }

    try {
      if (parsed.type === 'qna' && parsed.id) {
        if (isTablet) {
          // 태블릿: Qna 탭으로 이동하면서 initialChatRoomId 전달
          navigation.navigate('StudentTabs', {
            screen: 'Qna',
            params: { initialChatRoomId: parsed.id },
          });
        } else {
          // 모바일: ChatRoom 화면으로 직접 이동
          navigation.navigate('ChatRoom', { chatRoomId: parsed.id });
        }
        return;
      }

      if (parsed.type === 'publish' && parsed.id) {
        const publishDetail = await getPublishDetailById(parsed.id);

        if (!publishDetail) {
          Alert.alert('알림', '해당 문제를 찾을 수 없습니다.');
          return;
        }

        const groups = publishDetail.data ?? [];
        const targetGroup = groups.find((group) => group.progress !== 'DONE') ?? groups[0];

        if (!targetGroup) {
          Alert.alert('알림', '진행할 문제가 없습니다.');
          return;
        }

        initWithResume(targetGroup, {
          publishId: parsed.id,
          publishAt: publishDetail.publishAt,
          problemSetTitle: publishDetail.problemSet?.title,
          problemSetGroups: groups,
        });

        const phase = useProblemSessionStore.getState().phase;
        navigation.navigate(getInitialScreenForPhase(phase));
        return;
      }
    } catch (error) {
      console.error('[NotificationScreen] Error handling deep link:', error);
      Alert.alert('알림', '해당 콘텐츠를 불러올 수 없습니다.');
    }
  };

  return (
    <>
      <Header title='알림' />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className='mx-auto w-full'>
          <ContentInset className='gap-[10px] pt-[20px]'>
            <Text className='typo-title-2-bold pt-[10px] text-gray-800'>공지</Text>
            {notices.map((notice) => (
              <NotificationItem
                key={notice.id}
                icon='megaphone'
                title={notice.title}
                time={formatNoticeDate(notice.startAt)}
                hasBadge={!notice.isRead}
                onPress={() => {
                  if (!notice.isRead) {
                    putReadNotice(notice.id)
                      .then(() => {
                        invalidateNotices();
                      })
                      .catch((error) => {
                        console.error(
                          '[NotificationsScreen] Failed to mark notice as read:',
                          error
                        );
                      });
                  }
                  navigation.push('NotificationDetail', {
                    noticeId: notice.id,
                    title: notice.title,
                    date: notice.startAt,
                    content: notice.content,
                  });
                }}
              />
            ))}
            {notices.length === 0 && (
              <View className='flex-col items-center gap-[10px] py-[30px]'>
                <Text className='typo-body-1-medium text-gray-600'>공지사항이 없어요.</Text>
              </View>
            )}
          </ContentInset>
          <ContentInset className='pt-[28px]'>
            <View className='flex-row items-center justify-between'>
              <Text className='typo-title-2-bold text-gray-800'>알림</Text>
              <AnimatedPressable
                className='flex h-[48px] items-center justify-center px-[12px]'
                onPress={handleReadAll}
                disabled={unreadNotificationCount === 0}>
                <Text
                  className={`typo-body-2-medium ${unreadNotificationCount >= 1 ? 'text-primary-600' : 'text-gray-500'}`}>
                  모두 읽음
                </Text>
              </AnimatedPressable>
            </View>

            <View className='gap-[10px]'>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    icon={getNotificationIcon(notification.type)}
                    title={notification.title}
                    time={formatNotificationDate(notification.createdAt)}
                    hasBadge={!notification.isRead}>
                    <NotificationItem.Button
                      icon={ChevronRight}
                      variant='outline'
                      onPress={() => {
                        void handleNotificationPress(
                          notification.id,
                          notification.url,
                          notification.isRead
                        );
                      }}>
                      더보기
                    </NotificationItem.Button>
                  </NotificationItem>
                ))
              ) : (
                <View className='flex-col items-center gap-[10px] py-[10px]'>
                  <NoNotificationBellIcon />
                  <Text className='text-20b text-gray-800'>받은 알림이 없어요.</Text>
                </View>
              )}
            </View>
          </ContentInset>
        </View>
        <ContentInset className='flex-1 items-center justify-center gap-[10px] pt-[20px]'>
          <Text className='typo-body-1-medium text-gray-600'>
            7일 전 알림까지 확인할 수 있어요.
          </Text>
        </ContentInset>
      </ScrollView>
    </>
  );
};

export default NotificationScreen;
