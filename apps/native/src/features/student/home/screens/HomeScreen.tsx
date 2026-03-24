import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookOpenTextIcon, CalendarIcon, ChevronRightIcon } from 'lucide-react-native';

import { useAuthStore, useHomeStore } from '@stores';
import { useGetLastDiagnosis, useGetMonthlyPublish, useGetPublishDetail } from '@apis';
import { type StudentRootStackParamList } from '@navigation/student/types';
import { colors } from '@theme/tokens';
import { PointerSymbol } from '@components/system/icons';
import { AnimatedPressable, Container } from '@components/common';
import { useInvalidateAll } from '@hooks';
import { formatDateKey } from '@utils/date';

import ProblemViewer from '../../problem/components/ProblemViewer';
import ProblemSet from '../components/ProblemSet';
import CalendarModal from '../components/CalendarModal';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { selectedMonth, selectedDate, setSelectedMonth, setSelectedDate } = useHomeStore();
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const studentName = useAuthStore((state) => state.studentProfile?.name);

  const { data: diagnosisData } = useGetLastDiagnosis();
  const { data: studyData } = useGetMonthlyPublish({
    year: selectedMonth.getFullYear(),
    month: selectedMonth.getMonth() + 1,
  });

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
    <ScrollView
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Container className='flex-col gap-[12px] pt-[20px] md:flex-row'>
        <View className='flex-1 flex-col'>
          <View className='mb-[10px] w-full flex-row items-center gap-[8px] p-[8px]'>
            <View className='bg-primary-500 size-[42px] items-center justify-center rounded-full'>
              <PointerSymbol />
            </View>
            <View className='flex-1 flex-col gap-[2px]'>
              <Text className='text-18b text-black'>{studentName}만을 위한 코멘트</Text>
              <Text className='text-14r text-gray-700'>from 포인터 출제진</Text>
            </View>
            <AnimatedPressable onPress={() => {}} className='items-center justify-center p-[8px]'>
              <ChevronRightIcon size={20} color={colors['gray-700']} />
            </AnimatedPressable>
          </View>
          <View className='w-full flex-1 gap-[10px] rounded-[20px] bg-gray-300 p-[16px]'>
            <LinearGradient
              colors={[colors['primary-500'], colors['primary-200']]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ borderRadius: 10, padding: 1 }}>
              <View className='flex-col items-center justify-between rounded-[9px] bg-white p-[16px]'>
                <View className='mb-[8px] w-full flex-row items-center justify-between'>
                  <Text className='text-16sb text-primary-500'>이번 주 학습 상태</Text>
                  <Text className='text-13r text-gray-700'>
                    {diagnosisData?.createdAt
                      ? `${new Date(diagnosisData.createdAt).getMonth() + 1}월 ${new Date(
                          diagnosisData.createdAt
                        ).getDate()}일`
                      : ''}
                  </Text>
                </View>
                {diagnosisData?.content && <ProblemViewer problemContent={diagnosisData.content} />}
              </View>
            </LinearGradient>
          </View>
        </View>
        <View className='flex-1 flex-col'>
          <View className='mb-[10px] w-full flex-row items-center gap-[8px] p-[8px]'>
            <View className='size-[42px] items-center justify-center rounded-full bg-blue-200'>
              <BookOpenTextIcon size={20} color={colors['blue-500']} />
            </View>
            <View className='flex-1 flex-col gap-[2px]'>
              <Text className='text-18b text-black'>
                {publishDetailData?.problemSet?.title ?? '미출제'}
              </Text>

              <Text className='text-14r text-gray-700'>
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
          <ProblemSet
            publishDetail={publishDetailData ?? undefined}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </View>
      </Container>

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
  );
};

export default HomeScreen;
