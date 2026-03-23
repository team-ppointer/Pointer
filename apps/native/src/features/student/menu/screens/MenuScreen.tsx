import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Headset, Megaphone, ThumbsUp, History } from 'lucide-react-native';
import { TanstackQueryClient, useGetMe, useGetNoticeCount } from '@apis';
import { useAuthStore } from '@stores';
import { Container } from '@components/common';
import { type MenuStackParamList } from '@navigation/student/MenuNavigator';

import {
  UserProfileCard,
  MobileProfileCard,
  TeacherInfoCard,
  MenuListItem,
  MenuSection,
} from '../components';
import { ConfirmationModal } from '../../scrap/components/Dialog';
import { showToast } from '../../scrap/components/Notification';
import useIsTablet from '../../qna/hooks/useIsTablet';

const MenuScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const signOut = useAuthStore((state) => state.signOut);
  const queryClient = useQueryClient();
  const { data: noticeCount } = useGetNoticeCount();
  const { data } = useGetMe();
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/me').queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/notice/count').queryKey,
      });
    }, [queryClient])
  );

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  }, [signOut]);

  const isTablet = useIsTablet();

  return (
    <View className='w-full flex-1'>
      <Container className='h-[52px] justify-center bg-gray-100 py-[2px]'>
        <Text className='text-20b text-black'>전체 메뉴</Text>
      </Container>
      <Container className='flex-1'>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName='pb-[40px]'>
          <View className='h-[20px]' />
          <View className='gap-[10px]'>
            {isTablet ? (
              <>
                <UserProfileCard
                  name={data?.name}
                  school={data?.school}
                  grade={data?.grade}
                  onEditPress={() => navigation.navigate('MyInfo', { updatedData: data })}
                />
                <TeacherInfoCard teacherName={data?.teacherName} />
              </>
            ) : (
              <MobileProfileCard
                name={data?.name}
                school={data?.school}
                grade={data?.grade}
                teacherName={data?.teacherName}
                onEditPress={() => navigation.navigate('MyInfo', { updatedData: data })}
              />
            )}

            <MenuSection>
              <MenuListItem
                icon={Bell}
                title='알림 설정'
                onPress={() => navigation.navigate('NotificationSettings')}
              />
            </MenuSection>
            <MenuSection>
              <MenuListItem
                icon={Megaphone}
                title='공지사항'
                isNew={(noticeCount?.unreadCount ?? 0) > 0}
                onPress={() => navigation.navigate('Notice')}
              />
              <MenuListItem
                icon={Headset}
                title='고객센터'
                onPress={() => {
                  showToast('info', '고객센터 준비 중입니다.');
                }}
              />
              <MenuListItem
                icon={ThumbsUp}
                title='피드백 보내기'
                onPress={() => navigation.navigate('Feedback')}
              />
              <MenuListItem icon={History} title='앱 버전' showChevron={false}>
                <View className='justify-center'>
                  <Text className='text-16m text-blue-500'>1.0.1 최신 버전</Text>
                </View>
              </MenuListItem>
            </MenuSection>
            <MenuSection>
              <MenuListItem title='서비스 약관' onPress={() => navigation.navigate('Terms')} />
              <MenuListItem title='로그아웃' onPress={() => setIsLogoutVisible(true)} />
              <MenuListItem title='회원 탈퇴' onPress={() => navigation.navigate('Withdrawal')} />
            </MenuSection>
          </View>
        </ScrollView>
      </Container>
      <ConfirmationModal
        visible={isLogoutVisible}
        onClose={() => setIsLogoutVisible(false)}
        title='로그아웃 하시겠어요?'
        description={`빠르게 돌아와 실력 향상을 위한${isTablet ? ' ' : '\n'}학습을 이어나가요!`}
        buttons={[
          { label: '네', onPress: handleLogout, variant: 'default' },
          { label: '아니오', onPress: () => setIsLogoutVisible(false), variant: 'primary' },
        ]}
      />
    </View>
  );
};

export default MenuScreen;
