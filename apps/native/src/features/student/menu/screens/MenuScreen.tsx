import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useGetMe } from '@apis/student';
import { useAuthStore } from '@stores';
import { Container } from '@components/common';
import { Bell, Headset, Megaphone, ThumbsUp } from 'lucide-react-native';
import {
  UserProfileCard,
  TeacherInfoCard,
  MenuListItem,
  TextOnlyMenuItem,
  AppVersionItem,
  MenuSection,
} from '../components';
import { ScrollView } from 'react-native-gesture-handler';
import { ConfirmationModal } from '../../scrap/components/Dialog';
import { MenuStackParamList } from '../MenuNavigator';

const MenuScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const signOut = useAuthStore((state) => state.signOut);
  const { data, isLoading, isError } = useGetMe();
  const userInfo = data ?? null;

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  }, [signOut]);

  const [isLogoutVisible, setIsLogoutVisible] = useState(false);

  return (
    <>
      <Container className='px-6 py-12'>
        <View className='py-0.5'>
          <Text className='text-20b text-black'>전체 메뉴</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}>
          <View className='h-[20px]' />
          <View className='gap-[10px]'>
            <UserProfileCard
              name={data?.nickname ? data?.nickname : '포인터'}
              school={data?.school}
              grade={data?.grade}
              onEditPress={() => navigation.navigate('MyInfo')}
            />
            <TeacherInfoCard teacherName={data?.teacherName} />
            <MenuListItem
              icon={Bell}
              title='알림 설정'
              onPress={() => navigation.navigate('NotificationSettings')}
            />
            <MenuSection>
              <MenuListItem
                icon={Megaphone}
                title='공지사항'
                onPress={() => navigation.navigate('Notice')}
              />
              <MenuListItem icon={Headset} title='고객센터' isNew onPress={() => {}} />
              <MenuListItem
                icon={ThumbsUp}
                title='피드백 보내기'
                onPress={() => navigation.navigate('Feedback')}
              />
              <AppVersionItem version='1.0.1' isLatest={true} onPress={() => {}} />
            </MenuSection>
            <MenuSection>
              <TextOnlyMenuItem title='서비스 약관' onPress={() => navigation.navigate('Terms')} />
              <TextOnlyMenuItem title='로그아웃' onPress={() => setIsLogoutVisible(true)} />
              <TextOnlyMenuItem
                title='회원 탈퇴'
                onPress={() => navigation.navigate('Withdrawal')}
              />
            </MenuSection>
          </View>
        </ScrollView>

        {/* {isLoading ? (
        <Text>유저 정보 fetch 중...</Text>
      ) : isError ? (
        <Text>유저 정보 fetch 실패</Text>
      ) : userInfo ? (
        <Text>{JSON.stringify(userInfo).replace(/,/g, ',\n')}</Text>
      ) : (
        <Text>auth 정보 없음</Text>
      )}
      <TextButton onPress={handleLogout}>로그아웃</TextButton> */}
      </Container>
      <ConfirmationModal
        visible={isLogoutVisible}
        onClose={() => setIsLogoutVisible(false)}
        title='로그아웃 하시겠어요?'
        description='빠르게 돌아와 실력 향상을 위한 학습을 이어나가요!'
        buttons={[
          { label: '네', onPress: () => handleLogout(), variant: 'default' },
          { label: '아니오', onPress: () => setIsLogoutVisible(false), variant: 'primary' },
        ]}
      />
    </>
  );
};

export default MenuScreen;
