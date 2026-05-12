import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { type NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore, useHomeStore } from '@stores';
import {
  useGetMonthlyPublish,
  useGetPublishDetail,
  useGetDailyComments,
  useGetFocusCards,
  // useGetNotificationCount,
  // useGetNoticeCount,
} from '@apis';
// import { type StudentRootStackParamList } from '@navigation/student/types';
import { PointerLogo } from '@components/system/icons';
import { ContentInset, PointerContentView } from '@components/common';
// import { useInvalidateAll } from '@hooks';
import { formatDateKey } from '@utils/date';

import { buildHomeInit } from '../transforms/homeContentTransforms';
import ProblemSet from '../components/ProblemSet';
import CalendarModal from '../components/CalendarModal';

const HomeScreen = () => {
  // const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { selectedMonth, selectedDate, setSelectedMonth, setSelectedDate } = useHomeStore();
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const studentName = useAuthStore((state) => state.studentProfile?.name);

  const { data: studyData } = useGetMonthlyPublish({
    year: selectedMonth.getFullYear(),
    month: selectedMonth.getMonth() + 1,
  });

  // ── 홈 카드 API ──
  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const todayStr = formatDateKey(today);
  const tomorrowStr = formatDateKey(tomorrow);
  const { data: dailyComments } = useGetDailyComments(todayStr);
  const { data: todayFocusCards } = useGetFocusCards(todayStr);
  const { data: tomorrowFocusCards } = useGetFocusCards(tomorrowStr);

  const focusCards = useMemo(() => {
    if (!todayFocusCards && !tomorrowFocusCards) return null;
    const todayData = todayFocusCards?.data ?? [];
    const tomorrowData = tomorrowFocusCards?.data ?? [];
    const data = [...todayData, ...tomorrowData];
    return {
      requestId: todayFocusCards?.requestId ?? tomorrowFocusCards?.requestId ?? '',
      total: data.length,
      data,
    };
  }, [todayFocusCards, tomorrowFocusCards]);

  const homeInit = useMemo(() => {
    if (!studentName) return null;
    return buildHomeInit({
      name: studentName,
      comments: dailyComments ?? undefined,
      focusCards: focusCards ?? undefined,
    });
  }, [studentName, dailyComments, focusCards]);

  // const { data: notificationCountData } = useGetNotificationCount({});
  // const { data: noticeCountData } = useGetNoticeCount();

  // const hasUnread = !!(notificationCountData?.unreadCount || noticeCountData?.unreadCount);

  const selectedPublishId = useMemo(() => {
    if (!studyData?.data) return -1;
    const dateKey = formatDateKey(selectedDate);
    return studyData.data.find((item) => item.publishAt === dateKey)?.id ?? -1;
  }, [studyData, selectedDate]);

  const { data: publishDetailData } = useGetPublishDetail(selectedPublishId);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    if (
      date.getFullYear() !== selectedMonth.getFullYear() ||
      date.getMonth() !== selectedMonth.getMonth()
    ) {
      setSelectedMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  // const { invalidateAll } = useInvalidateAll();
  // const [refreshing, setRefreshing] = useState(false);

  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   await invalidateAll();
  //   setRefreshing(false);
  // };

  return (
    <View className='flex-1'>
      {/*<Header
        right={
          <Header.IconButton
            icon={hasUnread ? AlertBellButtonIcon : BellIcon}
            onPress={() => navigation.navigate('Notifications')}
          />
        }
      />*/}
      <ContentInset className='flex h-[56px] justify-center'>
        <View className='flex h-[40px] w-[120px] items-center justify-center'>
          <PointerLogo width={106} height={24} />
        </View>
      </ContentInset>
      <ContentInset className='flex-1 flex-col gap-[16px] pt-[20px] md:flex-row'>
        {/* 좌측: 홈 카드 WebView */}
        <View className='-m-[20px] flex-1 flex-col'>
          {homeInit && <PointerContentView initMessage={homeInit} />}
        </View>

        {/* 우측: 문제 세트 */}
        <View className='w-[312px] flex-col'>
          <ProblemSet
            publishDetail={publishDetailData ?? undefined}
            onPressDate={() => setIsCalendarModalVisible(true)}
          />
        </View>
      </ContentInset>

      <CalendarModal
        visible={isCalendarModalVisible}
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
        studyData={studyData?.data ?? []}
        onChangeMonth={setSelectedMonth}
        onDateSelect={handleDateChange}
        onNavigate={() => {
          setIsCalendarModalVisible(false);
        }}
        onClose={() => setIsCalendarModalVisible(false)}
      />
    </View>
  );
};

export default HomeScreen;
