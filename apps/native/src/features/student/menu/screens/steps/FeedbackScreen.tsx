import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container } from '@components/common';
import { ChevronLeft } from 'lucide-react-native';
import { MenuStackParamList } from '../../MenuNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';

const FEEDBACK_CATEGORIES = ['기능 개선', '버그 신고', '기타 문의', '칭찬하기'];

const FeedbackScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!selectedCategory) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    console.log('Submit feedback:', { selectedCategory, title, content });
    Alert.alert('감사합니다', '소중한 의견 감사합니다.\n빠른 시일 내에 확인하겠습니다.', [
      {
        text: '확인',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      className='w-full flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <SafeAreaView edges={['top']} className='flex-row items-center justify-between px-5 py-1'>
        <Pressable onPress={() => navigation.goBack()} className='p-2'>
          <ChevronLeft size={24} color='#000' />
        </Pressable>
        <Text className='text-20b text-black'>피드백 보내기</Text>
        <View />
      </SafeAreaView>

      <Container className='flex-1 pt-[10px]'>
        <ScrollView
          className='flex-1'
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'>
          <View className='gap-[20px]'>
            <View className='gap-[6px]'>
              <Text className='text-18sb text-black'>어떤 문제를 경험하셨나요?</Text>
              <Text className='text-12r text-gray-700'>
                제품에 대한 피드백이나 버그를 작성해 주세요!{`\n`}적어주신 내용으로 더 나은 서비스
                경험을 만들어 나가겠습니다.{' '}
              </Text>
            </View>

            <View className='gap-[8px]'>
              <Text className='text-14m text-gray-900'>피드백 내용</Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder='최소 10자 (최대 300자)'
                placeholderTextColor={colors['gray-600']}
                multiline
                maxLength={300}
                textAlignVertical='top'
                className='text-16r min-h-[200px] rounded-[10px] border border-gray-600 bg-white px-4 py-[11px]'
              />
              <View className='items-end'>
                <Text className='text-12r text-[#808087]'>{`${content.length}/300`}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} className=''>
          <Pressable
            onPress={handleSubmit}
            className='bg-primary-500 items-center rounded-[8px] py-[10px]'>
            <Text className='text-16m text-white'>보내기</Text>
          </Pressable>
        </SafeAreaView>
      </Container>
    </KeyboardAvoidingView>
  );
};

export default FeedbackScreen;
