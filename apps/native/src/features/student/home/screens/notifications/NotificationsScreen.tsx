import { Container, NotificationItem } from '@components/common';
import { NoNotificationBellIcon } from '@components/system/icons';
import { StudentRootStackParamList } from '@navigation/student/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, ScrollView, Pressable } from 'react-native';

const NotificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View className='mx-auto w-full'>
        <Container className='gap-[10px] pt-[16px]'>
          <Text className='text-20b text-gray-900'>공지</Text>
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
          <NotificationItem
            icon='megaphone'
            title='공지 제목이 작성돼요.'
            time='12월 4일'
            hasShadow={true}>
            <NotificationItem.Button variant='ghost'>더보기</NotificationItem.Button>
          </NotificationItem>
        </Container>
        <Container className='gap-[10px] pt-[26px]'>
          <View className='flex-row items-center justify-between'>
            <Text className='text-20b text-gray-900'>알림</Text>
            <Pressable className='px-2'>
              {/* <Text className='text-12sb text-blue-500'>모두 읽음</Text> */}
              <Text className='text-12sb text-gray-500'>모두 읽음</Text>
            </Pressable>
          </View>

          {/* <NotificationItem
            icon='message'
            title='12월 첫째 주 출제진의 피드백이 도착했어요.'
            time='오늘 16:48'
            hasBadge={true}
            hasShadow={true}>
            <NotificationItem.Button icon={ChevronRight} variant='outline'>
              더보기
            </NotificationItem.Button>
          </NotificationItem>
          <NotificationItem
            icon='book'
            title='오늘의 문제 세트가 도착했어요.'
            time='오늘 12:00'
            hasBadge={true}
            hasShadow={true}>
            <NotificationItem.Button>문제풀기</NotificationItem.Button>
          </NotificationItem>
          <NotificationItem
            icon='book'
            title='11월 28일의 문제 세트가 ###님을 기다리고 있어요.'
            time='12월 2일'
            hasShadow={true}>
            <NotificationItem.Button>문제풀기</NotificationItem.Button>
          </NotificationItem> */}

          <View className='flex-col items-center gap-[10px] py-[30px]'>
            <NoNotificationBellIcon />
            <Text className='text-20b text-gray-800'>받은 알림이 없어요.</Text>
          </View>
        </Container>
      </View>
      <Container className='flex-1 items-center justify-center gap-[10px] pb-[100px] pt-[20px]'>
        <Text className='text-14m text-gray-600'>7일 전 알림까지 확인할 수 있어요.</Text>
      </Container>
    </ScrollView>
  );
};

export default NotificationScreen;
