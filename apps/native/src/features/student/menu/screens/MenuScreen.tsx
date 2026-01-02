import React, { useCallback } from 'react';
import { Text } from 'react-native';

import { useGetMe } from '@apis/student';
import { useAuthStore } from '@stores';
import { Container, TextButton } from '@components/common';

const MenuScreen = () => {
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

  return (
    <Container className='flex-1 gap-6 px-6 py-12'>
      <Text className='text-18sb text-black'>전체 메뉴</Text>
      {isLoading ? (
        <Text>유저 정보 fetch 중...</Text>
      ) : isError ? (
        <Text>유저 정보 fetch 실패</Text>
      ) : userInfo ? (
        <Text>{JSON.stringify(userInfo).replace(/,/g, ',\n')}</Text>
      ) : (
        <Text>auth 정보 없음</Text>
      )}
      <TextButton onPress={handleLogout}>로그아웃</TextButton>
    </Container>
  );
};

export default MenuScreen;
