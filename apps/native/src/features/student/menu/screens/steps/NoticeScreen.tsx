import React from 'react';
import { View, Text, Pressable, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container, NotificationItem } from '@components/common';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { MenuStackParamList } from '../../MenuNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Notice {
  id: number;
  title: string;
  date: string;
  isNew?: boolean;
}

const MOCK_NOTICES: Notice[] = [
  { id: 1, title: '2024년 1월 정기 점검 안내', date: '2024.01.15', isNew: true },
  { id: 2, title: '겨울방학 특강 일정 안내', date: '2024.01.10' },
  { id: 3, title: '새로운 기능 업데이트 안내', date: '2024.01.05' },
  { id: 4, title: '이용 약관 변경 안내', date: '2023.12.28' },
  { id: 5, title: '개인정보 처리방침 변경 안내', date: '2023.12.20' },
];

const NoticeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();

  const handleNoticePress = (notice: Notice) => {
    console.log('Notice pressed:', notice);
  };

  const renderNoticeItem = ({ item }: { item: Notice }) => (
    <NotificationItem
      icon='megaphone'
      hasBadge={item.isNew}
      title={item?.title ?? ''}
      time={item?.date ?? ''}
      hasShadow={true}>
      <NotificationItem.Button variant='ghost' onPress={() => handleNoticePress(item)}>
        더보기
      </NotificationItem.Button>
    </NotificationItem>
  );

  return (
    <View className='w-full flex-1'>
      <SafeAreaView edges={['top']} className='flex-row items-center justify-between px-5 py-1'>
        <Pressable onPress={() => navigation.goBack()} className='p-2'>
          <ChevronLeft size={24} color='#000' />
        </Pressable>
        <Text className='text-20b text-black'>공지사항</Text>
        <View />
      </SafeAreaView>

      <Container className='mt-[10px] flex-1'>
        <FlatList
          data={MOCK_NOTICES}
          renderItem={renderNoticeItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 4 }}
          ListEmptyComponent={
            <View className='items-center justify-center py-20'>
              <Text className='text-16r text-gray-500'>등록된 공지사항이 없습니다</Text>
            </View>
          }
        />
      </Container>
    </View>
  );
};

export default NoticeScreen;
