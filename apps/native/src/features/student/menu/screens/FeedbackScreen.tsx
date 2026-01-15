import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AnimatedPressable, Container } from '@components/common';
import { ScreenLayout } from '../components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';
import { usePostFeedback } from '@/apis/controller/student/me';
import { showToast } from '@/features/student/scrap/components/Notification';

const FeedbackScreen = () => {
  const { mutate: postFeedback } = usePostFeedback();

  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) {
      showToast('error', '내용을 입력해주세요.');
      return;
    }
    if (content.length < 10) {
      showToast('error', '최소 10자 이상 입력해주세요.');
      return;
    }
    postFeedback({ content });
    showToast('success', '피드백이 제출되었습니다.');
    setContent('');
  };

  return (
    <KeyboardAvoidingView
      className='w-full flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <ScreenLayout title='피드백 보내기'>
        <Container className='flex-1 pt-[10px]'>
          <ScrollView
            className='flex-1'
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'>
            <Text className='text-18sb text-black mb-[6px]'>어떤 문제를 경험하셨나요?</Text>
            <Text className='text-12r text-gray-700 mb-[20px]'>
              제품에 대한 피드백이나 버그를 작성해 주세요!{`\n`}적어주신 내용으로 더 나은 서비스
              경험을 만들어 나가겠습니다.
            </Text>

            <Text className='text-14m text-gray-900 mb-[8px]'>피드백 내용</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder='최소 10자 (최대 300자)'
              placeholderTextColor={colors['gray-600']}
              multiline
              maxLength={300}
              textAlignVertical='top'
              className='text-16r min-h-[200px] rounded-[10px] mb-[8px] border border-gray-300 focus:border-gray-600 bg-white px-[16px] py-[11px]'
            />
            <View className='items-end'>
              <Text className='text-12r text-[#808087]'>{`${content.length}/300`}</Text>
            </View>
          </ScrollView>

          <SafeAreaView edges={['bottom']} className='mb-[18px]'>
            <AnimatedPressable
              onPress={handleSubmit}
              className='bg-primary-500 items-center rounded-[8px] py-[10px]'>
              <Text className='text-16m text-white'>보내기</Text>
            </AnimatedPressable>
          </SafeAreaView>
        </Container>
      </ScreenLayout>
    </KeyboardAvoidingView>
  );
};

export default FeedbackScreen;
