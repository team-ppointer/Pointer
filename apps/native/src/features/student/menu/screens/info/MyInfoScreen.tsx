import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container } from '@components/common';
import { BookHeartIcon, CircleStarIcon, ProfileBasicIcon } from '@components/system/icons';
import { useGetMe } from '@apis';
import { MenuStackParamList } from '@navigation/student/MenuNavigator';
import { InfoSection, ScreenLayout } from '../../components';
import {
  gradeOptions,
  levelOptions,
  mathSubjectOptions,
} from '@features/student/onboarding/constants';

const MyInfoScreen = () => {
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const { data } = useGetMe();

  return (
    <ScreenLayout title='내 정보'>
      <ScrollView
        className='flex-1 pt-[10px] bg-blue-100'
        contentContainerStyle={{ flexGrow: 1 }}>
        <Container className='gap-[28px] pb-[24px] bg-gray-100 pt-[100%] -mt-[100%]'>
          <InfoSection
            icon={<ProfileBasicIcon />}
            title='기본 정보'
            fields={[
              {
                label: '닉네임',
                value: data?.name || '',
                onPress: () => {
                  navigation.navigate('EditNickname', { initialNickname: data?.name });
                },
              },
              {
                label: '휴대폰 번호',
                value: data?.phoneNumber || '',
                onPress: () => {
                  navigation.navigate('EditPhoneNumber');
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
                  : gradeOptions.find((option) => option.value === data?.grade)?.label || '',
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
                value:
                  mathSubjectOptions.find((option) => option.value === data?.selectSubject)
                    ?.label || '',
                onPress: () =>
                  navigation.navigate('EditMathSubject', {
                    initialMathSubject: data?.selectSubject,
                  }),
              },
            ]}
          />
        </Container>

        <Container
          className='flex-1 bg-blue-100 pt-[24px]'
          style={{ paddingBottom: 24 + bottom }}>
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
    </ScreenLayout>
  );
};

export default MyInfoScreen;
