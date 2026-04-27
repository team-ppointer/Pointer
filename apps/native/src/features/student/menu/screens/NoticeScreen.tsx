import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ContentInset, NotificationItem } from '@components/common';
import { putReadNotice, useGetNotice, useInvalidateNoticeData } from '@apis';
import { type StudentRootStackParamList } from '@/navigation/student/types';

import { ScreenLayout } from '../components';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `오늘 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const PAGE_SIZE = 20;
const NOTICE_LIST_CONTENT_STYLE = { gap: 10, paddingTop: 16, flexGrow: 1 } as const;

const NoticeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const [page, setPage] = useState(0);
  const [allNotices, setAllNotices] = useState<
    { id: number; title: string; startAt: string; content: string; isRead: boolean }[]
  >([]);

  const { data: noticeData, isFetching } = useGetNotice({ page, size: PAGE_SIZE });
  const { invalidateNoticeCount, invalidateNotice } = useInvalidateNoticeData();

  useEffect(() => {
    const list = noticeData?.data;
    const dataPage = noticeData?.page != null ? Number(noticeData.page) : undefined;
    if (!Array.isArray(list) || dataPage === undefined || dataPage !== page) return;
    if (page === 0) {
      setAllNotices(list);
    } else {
      setAllNotices((prev) => [...prev.slice(0, page * PAGE_SIZE), ...list]);
    }
  }, [noticeData, page]);

  const readNotice = useCallback(
    (noticeIds: number) => {
      putReadNotice(noticeIds).then(() => {
        invalidateNoticeCount();
        invalidateNotice();
      });
    },
    [invalidateNoticeCount, invalidateNotice]
  );

  const hasMore = noticeData ? page < noticeData.lastPage : false;

  const handleEndReached = useCallback(() => {
    if (hasMore && !isFetching) setPage((p) => p + 1);
  }, [hasMore, isFetching]);

  const renderItem = useCallback(
    ({ item: notice }: { item: (typeof allNotices)[number] }) => (
      <NotificationItem
        icon='megaphone'
        title={notice.title}
        time={formatDate(notice.startAt)}
        hasBadge={!notice.isRead}>
        <NotificationItem.Button
          variant='ghost'
          onPress={() => {
            if (!notice.isRead) {
              readNotice(notice.id);
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
    ),
    [readNotice, navigation]
  );

  const keyExtractor = useCallback((item: { id: number }) => String(item.id), []);

  return (
    <ScreenLayout title='공지사항'>
      {allNotices.length === 0 && !isFetching ? (
        <View className='flex-col items-center gap-[10px] py-[30px]'>
          <Text className='text-14m text-gray-600'>공지사항이 없어요.</Text>
        </View>
      ) : (
        <ContentInset>
          <FlatList
            data={allNotices}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            contentContainerStyle={NOTICE_LIST_CONTENT_STYLE}
          />
        </ContentInset>
      )}
    </ScreenLayout>
  );
};

export default NoticeScreen;
