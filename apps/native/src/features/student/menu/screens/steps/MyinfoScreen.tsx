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
const MyinfoScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const { data } = useGetMe();

  // const [name, setName] = useState(data?.name || '');
  // const [grade, setGrade] = useState(data?.grade?.toString() || '');
  // const [selectSubject, setSelectSubject] = useState(data?.selectSubject || '');
  // const [level, setLevel] = useState(data?.level?.toString() || '');
  const [isSaveVisible, setIsSaveVisible] = useState(false);

  // // 초기값 저장
  // const initialValues = useMemo(() => {
  //   if (!data) return null;
  //   return {
  //     nickname: data?.nickname || '',
  //     name: data?.name || '',
  //     grade: data?.grade?.toString() || '',
  //     selectSubject: data?.selectSubject || '',
  //     level: data?.level?.toString() || '',
  //   };
  // }, [data]);

  const handleSave = async () => {
    // if (!initialValues) return;
    // const updateData: Record<string, any> = {};
    // if (name !== initialValues.name) {
    //   updateData.nickname = name;
    // }
    // if (grade !== initialValues.grade) {
    //   updateData.grade = grade as 'ONE' | 'TWO' | 'THREE' | 'N_TIME';
    // }
    // if (selectSubject !== initialValues.selectSubject) {
    //   updateData.selectSubject = selectSubject as 'MIJUKBUN' | 'HWAKTONG' | 'KEEHA';
    // }
    // if (level !== initialValues.level) {
    //   updateData.level = level ? parseInt(level, 10) : undefined;
    // }
    // // 변경된 필드가 없으면 API 호출하지 않음
    // if (Object.keys(updateData).length === 0) {
    //   return;
    // }
    // try {
    //   await putMe(updateData);
    // } catch (error) {
    //   console.error('Failed to save user info:', error);
    // }
    // console.log('Save user info:', updateData);
  };

  return (
    <>
      <View className='w-full flex-1'>
        <SafeAreaView edges={['top']} className='flex-row items-center justify-between px-5 py-1'>
          <Pressable onPress={() => navigation.goBack()} className='p-2'>
            <ChevronLeft size={32} color='#000' />
          </Pressable>
          <Text className='text-20b text-black'>내 정보</Text>
          <Pressable onPress={() => setIsSaveVisible(true)} className='items-center pr-4'>
            <Text className='text-14sb text-gray-600'>저장하기</Text>
          </Pressable>
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
                  value: data?.school?.name || '',
                  onPress: () => navigation.navigate('EditSchool', { initialSchool: data?.school }),
                },
                {
                  label: '수학등급',
                  value: data?.level?.toString() || '',
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
      <ConfirmationModal
        visible={isSaveVisible}
        onClose={() => setIsSaveVisible(false)}
        title='변경사항이 있습니다. 저장할까요?'
        description='저장하지 않으면 변경사항이 모두 사라집니다.'
        buttons={[
          { label: '그냥 나가기', onPress: () => handleSave(), variant: 'default' },
          { label: '저장하고 나가기', onPress: () => setIsSaveVisible(false), variant: 'primary' },
        ]}
      />
    </>
  );
};

export default MyinfoScreen;
