import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container } from '@components/common';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { BookHeartIcon, CircleStarIcon, ProfileBasicIcon } from '@components/system/icons';
import { useGetMe } from '@apis/student';
import { MenuStackParamList } from '../../MenuNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfoSection } from '../../components';
import { ConfirmationModal } from '@/features/student/scrap/components/Dialog';
const MyinfoScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const { data } = useGetMe();

  const [name, setName] = useState(data?.name || '');
  const [school, setSchool] = useState(
    typeof data?.school === 'string' ? data.school : data?.school?.name || ''
  );
  const [grade, setGrade] = useState(data?.grade?.toString() || '');

  const handleSave = () => {
    console.log('Save user info:', { name, school, grade });
    // navigation.goBack();
  };

  const [isSaveVisible, setIsSaveVisible] = useState(false);

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
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false} bounces={false}>
          <Container className='flex-1 gap-7 bg-gray-100 py-6'>
            <InfoSection
              icon={<ProfileBasicIcon />}
              title='기본 정보'
              fields={[
                { label: '닉네임', value: data?.nickname || '' },
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
                { label: '학교 · 학년', value: data?.school?.name || '' },
                { label: '수학등급', value: data?.level?.toString() || '' },
                { label: '선택과목', value: data?.selectSubject || '' },
              ]}
            />
          </Container>

          <Container className='flex-1 gap-7 bg-blue-100 py-6'>
            <InfoSection
              icon={<CircleStarIcon />}
              title='계정 정보'
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
