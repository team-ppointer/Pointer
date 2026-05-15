import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore, useHomeStore } from '@stores';
import {
  useGetMonthlyPublish,
  useGetPublishDetail,
  useGetDailyComments,
  dailyCommentQueries,
  focusCardQueries,
} from '@apis';
import { PointerLogo } from '@components/system/icons';
import { ContentInset, PointerContentView } from '@components/common';
import { formatDateKey } from '@utils/date';

import { buildHomeInit } from '../transforms/homeContentTransforms';
import { useHomeFocusCards } from '../hooks/useHomeFocusCards';
import ProblemSet from '../components/ProblemSet';
import CalendarModal from '../components/CalendarModal';

const HomeScreen = () => {
  const { selectedMonth, selectedDate, setSelectedMonth, setSelectedDate } = useHomeStore();
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const studentName = useAuthStore((state) => state.studentProfile?.name);
  const queryClient = useQueryClient();

  const { data: studyData } = useGetMonthlyPublish({
    year: selectedMonth.getFullYear(),
    month: selectedMonth.getMonth() + 1,
  });

  // ── 홈 카드 API ──
  // 마운트 시점의 오늘 — 디바이스 자정 넘김 시 자동 갱신은 별도 처리(useFocusEffect)에 위임.
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateKey(today), [today]);
  const { data: dailyComments } = useGetDailyComments(todayStr);
  const { data: focusCardItems } = useHomeFocusCards(today);

  // 화면 진입 시 홈 카드 데이터 invalidate — 다른 탭/화면 다녀와도 최신 상태 유지
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: dailyCommentQueries.all() });
      queryClient.invalidateQueries({ queryKey: focusCardQueries.all() });
    }, [queryClient])
  );

  const homeInit = useMemo(() => {
    if (!studentName) return null;
    return buildHomeInit({
      name: studentName,
      todayStr,
      comments: dailyComments,
      focusCardItems,
    });
  }, [studentName, todayStr, dailyComments, focusCardItems]);

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

  return (
    <View className='flex-1'>
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
