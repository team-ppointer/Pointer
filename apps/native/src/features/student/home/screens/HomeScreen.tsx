import React from 'react';
import { View, Text } from 'react-native';
import NotificationItem from '@/components/common/NotificationItem';
import Container from '@/components/common/Container';
import TeacherIcon from '@/components/system/icons/TeacherIcon';
import Svg, { Path } from 'react-native-svg';
import LearningStatus from '../components/LearningStatus';

const HomeScreen = () => {
  return (
    <>
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
            <NotificationItem.Button variant='ghost'>더보기</NotificationItem.Button>
          </NotificationItem>
        </Container>

        {/* Learning Status Container */}
        <LearningStatus
          studentName='테스트'
          date='11월 04일'
          content='이번주에는 두 다항함수의 공통 접선 문제 유형이 취약한거 같아. 접점에서 두 다항함수의 접선이 같다는걸 생각하면서 문제를 풀어보자!'
        />
      </View>
      
    </>
  );
};

export default HomeScreen;
