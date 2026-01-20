import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable, Container } from '@components/common';
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
} from '@apis';
import { StudentRootStackParamList } from '@navigation/student/types';
import { BookOpenTextIcon, CalendarIcon, ChevronRightIcon, XIcon } from 'lucide-react-native';
import ProblemViewer from '../../problem/components/ProblemViewer';
import { colors } from '@theme/tokens';
import { PointerSymbol } from '@components/system/icons';
import { BlurView } from 'expo-blur';
import { useInvalidateAll } from '@hooks';
const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPublishId, setSelectedPublishId] = useState<number>(-1);
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
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
            <View className='bg-primary-500 h-[42px] w-[42px] items-center justify-center rounded-full'>
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
            {/* <View className='flex-col rounded-[10px] bg-white p-[16px]'>
              <Text className='text-16sb text-primary-500 mb-[8px]'>이번 주 개념</Text>
              <ProblemViewer problemContent={diagnosisData?.content ?? ''} minHeight={200} />
              <Text>미구현</Text>
            </View> */}
          </View>
        </View>
        <View className='flex-1 flex-col'>
          <View className='mb-[10px] w-full flex-row items-center gap-[8px] p-[8px]'>
            <View className='h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-200'>
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

      {/* Calendar Modal */}
      <Modal
        transparent
        animationType='fade'
        visible={isCalendarModalVisible}
        onRequestClose={() => setIsCalendarModalVisible(false)}>
        <BlurView intensity={20} tint='light' style={{ flex: 1, backgroundColor: '#C6CAD480' }}>
          <View className='flex-1 items-center justify-center'>
            <Pressable
              className='absolute inset-0'
              onPress={() => setIsCalendarModalVisible(false)}
            />
            <View className='mx-[20px] w-full max-w-[600px] rounded-[20px] bg-white'>
              {/* Modal Header */}
              <AnimatedPressable
                onPress={() => setIsCalendarModalVisible(false)}
                className='absolute -right-[60px] top-0 h-[48px] w-[48px] items-center justify-center rounded-[12px] bg-white'>
                <XIcon size={24} color='black' />
              </AnimatedPressable>

              {/* Calendar Content */}
              <ProblemCalendar
                selectedMonth={selectedMonth}
                selectedDate={selectedDate}
                onChangeMonth={setSelectedMonth}
                onDateSelect={handleDateChange}
                studyData={studyData?.data ?? []}
                isModal
              />

              {/* Navigate Button */}
              <AnimatedPressable
                onPress={() => {
                  setIsCalendarModalVisible(false);
                  // Navigate to problem set if available
                }}
                className='bg-primary-500 m-[20px] mt-[20px] rounded-[8px] p-[12px]'>
                <Text className='text-16m text-center text-white'>
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 문제 세트로 이동
                </Text>
              </AnimatedPressable>
            </View>
          </View>
        </BlurView>
      </Modal>
    </ScrollView>
  );
};

export default HomeScreen;
