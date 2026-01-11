import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container } from '@components/common';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { BookHeartIcon, CircleStarIcon, ProfileBasicIcon } from '@components/system/icons';
import { putMe, useGetMe } from '@apis/student';
import { MenuStackParamList } from '../../MenuNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfoSection } from '../../components';
import { ConfirmationModal } from '@/features/student/scrap/components/Dialog';
import { OnboardingStackParamList } from '@/features/student/onboarding/screens/types';
import { gradeOptions, levelOptions } from '@/features/student/onboarding/constants';
const MyinfoScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const { data } = useGetMe();

  return (
    <View className='w-full flex-1'>
      <SafeAreaView edges={['top']} className='flex-row items-center justify-between px-5 py-1'>
        <Pressable onPress={() => navigation.goBack()} className='p-2'>
          <ChevronLeft size={32} color='#000' />
        </Pressable>
        <Text className='text-20b text-black'>내 정보</Text>
        <View className='w-[10px]' />
      </SafeAreaView>
      <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Container className='flex-1 gap-7 bg-gray-100 py-6'>
          <InfoSection
            icon={<ProfileBasicIcon />}
            title='기본 정보'
            fields={[
              {
                label: '닉네임',
                value: data?.nickname || '',
                onPress: () => {
                  navigation.navigate('EditNickname', { initialNickname: data?.nickname });
                },
              },
              {
                label: '휴대폰 번호',
                value: data?.phoneNumber || '',
                onPress: () => {
                  navigation.navigate('PhoneNumber');
                },
              },
            ]}
          />
          <InfoSection
            icon={<BookHeartIcon />}
            title='학습 정보'
            fields={[
              {
                label: '학교 · 학년',
                value: data?.school?.name
                  ? `${data?.school?.name} ${gradeOptions.find((option) => option.value === data?.grade)?.label}`
                  : '',
                onPress: () =>
                  navigation.navigate('EditSchool', {
                    initialSchool: data?.school
                      ? {
                          id: data.school.id,
                          name: data.school.name,
                          sido: data.school.sido,
                          grade: data.grade,
                        }
                      : { id: 0, name: '', sido: '' },
                  }),
              },
              {
                label: '수학등급',
                value: levelOptions.find((option) => option.value === data?.level)?.label || '',
                onPress: () => navigation.navigate('EditScore', { initialScore: data?.level }),
              },
              {
                label: '선택과목',
                value: data?.selectSubject || '',
                onPress: () =>
                  navigation.navigate('EditMathSubject', {
                    initialMathSubject: data?.selectSubject,
                  }),
              },
            ]}
          />
        </Container>

        <Container className='flex-1 gap-7 bg-blue-100 py-6'>
          <InfoSection
            icon={<CircleStarIcon />}
            title='계정 정보'
            showChevron={false}
            fields={[
              { label: '연동 계정', value: data?.provider || '' },
              { label: '이메일', value: data?.email || '' },
            ]}
          />
        </Container>
      </ScrollView>
    </View>
  );
};

export default MyinfoScreen;
