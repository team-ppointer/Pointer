import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BellIcon, BookOpenTextIcon, CalendarIcon, ChevronRightIcon } from 'lucide-react-native';

import { useAuthStore, useHomeStore } from '@stores';
import {
  useGetLastDiagnosis,
  useGetMonthlyPublish,
  useGetPublishDetail,
  useGetNotificationCount,
  useGetNoticeCount,
} from '@apis';
import { type StudentRootStackParamList } from '@navigation/student/types';
import { colors, shadow } from '@theme/tokens';
import { AlertBellButtonIcon, PointerSymbol } from '@components/system/icons';
import { AnimatedPressable, ContentInset, Header, PointerContentView } from '@components/common';
import { useInvalidateAll } from '@hooks';
import { formatDateKey } from '@utils/date';
import { buildDocumentInit } from '@features/student/problem/transforms/contentRendererTransforms';

import ProblemSet from '../components/ProblemSet';
import CalendarModal from '../components/CalendarModal';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { selectedMonth, selectedDate, setSelectedMonth, setSelectedDate } = useHomeStore();
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const studentName = useAuthStore((state) => state.studentProfile?.name);

  const { data: diagnosisData } = useGetLastDiagnosis();
  const diagnosisContent = useMemo(
    () =>
      diagnosisData?.content
        ? buildDocumentInit({ content: diagnosisData.content, fontStyle: 'sans-serif' })
        : null,
    [diagnosisData?.content]
  );
  const { data: studyData } = useGetMonthlyPublish({
    year: selectedMonth.getFullYear(),
    month: selectedMonth.getMonth() + 1,
  });

  const { data: notificationCountData } = useGetNotificationCount({});
  const { data: noticeCountData } = useGetNoticeCount();

  const hasUnread = !!(notificationCountData?.unreadCount || noticeCountData?.unreadCount);

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

  const { invalidateAll } = useInvalidateAll();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await invalidateAll();
    setRefreshing(false);
  };

  return (
    <View className='flex-1'>
      <Header
        right={
          <Header.IconButton
            icon={hasUnread ? AlertBellButtonIcon : BellIcon}
            onPress={() => navigation.navigate('Notifications')}
          />
        }
      />
      <ScrollView
        className='flex-1'
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ContentInset className='flex-col gap-[16px] pt-[20px] md:flex-row'>
          <View className='flex-1 flex-col'>
            <View className='mb-[16px] w-full flex-row items-center gap-[8px]'>
              <View className='bg-primary-600 size-[48px] items-center justify-center rounded-full'>
                <PointerSymbol />
              </View>
              <View className='flex-1 flex-col'>
                <Text className='typo-heading-1-bold text-black'>
                  {studentName}만을 위한 코멘트
                </Text>
                <Text className='typo-label-medium text-gray-700'>from 포인터 출제진</Text>
              </View>
              <AnimatedPressable onPress={() => {}} className='items-center justify-center p-[8px]'>
                <ChevronRightIcon size={20} color={colors['gray-700']} />
              </AnimatedPressable>
            </View>
            <View className='w-full flex-1 gap-[10px] rounded-[20px] bg-gray-300 p-[16px]'>
              <View
                className='border-primary-400 flex-col rounded-[9px] border bg-white px-[16px] py-[12px]'
                style={shadow[100]}>
                <View className='mb-[8px] w-full flex-row items-center justify-between'>
                  <Text className='typo-heading-2-semibold text-primary-600'>
                    이번 주 학습 상태
                  </Text>
                  <Text className='typo-label-medium mr-[2px] text-gray-700'>
                    {diagnosisData?.createdAt
                      ? `${new Date(diagnosisData.createdAt).getMonth() + 1}월 ${new Date(
                          diagnosisData.createdAt
                        ).getDate()}일`
                      : ''}
                  </Text>
                </View>
                {diagnosisContent ? (
                  <PointerContentView initMessage={diagnosisContent} />
                ) : (
                  <Text className='typo-body-1-regular text-gray-700'>
                    아직 등록된 학습 상태가 없어요
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View className='flex-1 flex-col'>
            <View className='mb-[16px] w-full flex-row items-center gap-[8px]'>
              <View className='bg-primary-200 size-[48px] items-center justify-center rounded-full'>
                <BookOpenTextIcon size={24} color={colors['primary-600']} />
              </View>
              <View className='flex-1 flex-col'>
                <Text className='typo-heading-1-bold line-clamp-1 truncate text-black'>
                  {publishDetailData?.problemSet?.title ?? '미출제'}
                </Text>

                <Text className='typo-label-medium text-gray-700'>
                  {`${String(selectedDate.getMonth() + 1).padStart(2, '0')}월 ${String(selectedDate.getDate()).padStart(2, '0')}일`}
                  {publishDetailData?.publishAt &&
                    ` · ${publishDetailData?.problemSet?.problems?.length ?? 0}문제`}
                </Text>
              </View>
              <AnimatedPressable
                onPress={() => setIsCalendarModalVisible(true)}
                className='items-center justify-center rounded-[8px] p-[8px]'>
                <CalendarIcon size={20} color={colors['gray-700']} />
              </AnimatedPressable>
            </View>
            <ProblemSet publishDetail={publishDetailData ?? undefined} />
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
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
