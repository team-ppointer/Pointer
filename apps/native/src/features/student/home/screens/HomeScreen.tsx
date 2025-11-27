import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import NotificationItem from '@/components/common/NotificationItem';
import Container from '@/components/common/Container';
import LearningStatus from '../components/LearningStatus';
import ProblemCalendar from '../components/ProblemCalendar';
import ProblemSet from '../components/ProblemSet';
// import { useNotificationNavigation } from '@/hooks/useNotificationNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootNavigator';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Header Container */}
      <View className='mx-auto w-full bg-blue-100'>
        {/* Notification Container */}
        <Container className='gap-[10px] pt-[16px]'>
          <NotificationItem
            variant='blue'
            icon='book-white'
            title='오늘의 문제 세트가 도착했어요.'
            time='오늘 12:00'
            hasShadow={true}>
            <NotificationItem.Button>문제풀기</NotificationItem.Button>
          </NotificationItem>

          <NotificationItem
            icon='megaphone'
            title='공지 제목이 작성돼요.'
            time='12월 4일'
            hasShadow={true}>
            <NotificationItem.Button
              variant='ghost'
              onPress={() => navigation.push('NotificationDetail')}>
              더보기
            </NotificationItem.Button>
          </NotificationItem>
        </Container>

        {/* Learning Status Container */}
        <LearningStatus
          studentName='테스트'
          date='11월 04일'
          content='이번주에는 두 다항함수의 공통 접선 문제 유형이 취약한거 같아. 접점에서 두 다항함수의 접선이 같다는걸 생각하면서 문제를 풀어보자!'
        />
      </View>
      <Container className='gap-[16px] pt-[24px]'>
        <Text className='text-24b text-gray-900'>날짜별 문제 리스트</Text>
        <View className='flex-row items-start gap-[20px]'>
          <ProblemCalendar />
          <ProblemSet />
        </View>
      </Container>
    </ScrollView>
  );
};

export default HomeScreen;
