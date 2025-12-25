import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { NotificationItem, Container } from '@components/common';
import LearningStatus from '../components/LearningStatus';
import ProblemCalendar from '../components/ProblemCalendar';
import ProblemSet from '../components/ProblemSet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@stores';
import {
  useGetNotice,
  useGetLastDiagnosis,
  useGetMonthlyPublish,
  useGetPublishDetail,
} from '@apis/student';
import { StudentRootStackParamList } from '@navigation/student/types';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPublishId, setSelectedPublishId] = useState<number>(-1);
  const studentName = useAuthStore((state) => state.studentProfile?.name);

  const { data: noticeData } = useGetNotice();
  const { data: diagnosisData } = useGetLastDiagnosis();
  const { data: studyData } = useGetMonthlyPublish({
    year: selectedMonth.getFullYear(),
    month: selectedMonth.getMonth() + 1,
  });

  useEffect(() => {
    if (studyData?.data) {
      const selectedDateString = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      setSelectedPublishId(
        studyData.data.find((item) => item.publishAt === selectedDateString)?.id ?? -1
      );
    } else {
      setSelectedPublishId(-1);
    }
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
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Header Container */}
      <View className='mx-auto w-full bg-blue-100 pt-[100vh] -mt-[100vh]'>
        {/* Notification Container */}
        <Container className='gap-[10px] pt-[16px]'>
          <NotificationItem
            variant='blue'
            icon='book-white'
            title='오늘의 문제 세트가 도착했어요.'
            time='오늘 12:00'
            hasShadow={true}>
            <NotificationItem.Button onPress={() => {}}>문제풀기</NotificationItem.Button>
          </NotificationItem>

          <NotificationItem
            icon='megaphone'
            title={noticeData?.data[0].content ?? ''}
            time={noticeData?.data[0].startAt ?? ''}
            hasShadow={true}>
            <NotificationItem.Button
              variant='ghost'
              onPress={() => navigation.navigate('NotificationDetail')}>
              더보기
            </NotificationItem.Button>
          </NotificationItem>
        </Container>

        {/* Learning Status Container */}
        <LearningStatus
          studentName={studentName ?? ''}
          date={diagnosisData?.createdAt ?? ''}
          content={diagnosisData?.content ?? ''}
        />
      </View>
      <Container className='gap-[16px] pt-[24px]'>
        <Text className='text-24b text-gray-900'>날짜별 문제 리스트</Text>
        <View className='flex-col gap-[20px] md:flex-row md:items-start'>
          <ProblemCalendar
            selectedMonth={selectedMonth}
            selectedDate={selectedDate}
            onChangeMonth={setSelectedMonth}
            onDateSelect={handleDateChange}
            studyData={studyData?.data ?? []}
          />
          <ProblemSet
            publishDetail={publishDetailData ?? undefined}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </View>
      </Container>
    </ScrollView>
  );
};

export default HomeScreen;
