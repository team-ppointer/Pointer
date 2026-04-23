import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable, ContentInset } from '@components/common';
import { colors } from '@theme/tokens';
import { usePostFeedback } from '@apis';
import { showToast } from '@features/student/scrap/components/Notification';

import { ScreenLayout } from '../components';

const FeedbackScreen = () => {
  const insets = useSafeAreaInsets();
  const { mutate: postFeedback, isPending } = usePostFeedback();

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
    postFeedback(
      { content },
      {
        onSuccess: () => {
          showToast('success', '피드백이 제출되었습니다.');
          setContent('');
        },
        onError: () => {
          showToast('error', '피드백 제출에 실패했습니다. 다시 시도해주세요.');
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      className='w-full flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <ScreenLayout title='피드백 보내기'>
        <ContentInset className='flex-1 pt-[10px]'>
          <ScrollView
            className='flex-1'
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'>
            <Text className='text-18sb mb-[6px] text-black'>어떤 문제를 경험하셨나요?</Text>
            <Text className='text-12r mb-[20px] text-gray-700'>
              제품에 대한 피드백이나 버그를 작성해 주세요!{`\n`}적어주신 내용으로 더 나은 서비스
              경험을 만들어 나가겠습니다.
            </Text>

            <Text className='text-14m mb-[8px] text-gray-900'>피드백 내용</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder='최소 10자 (최대 300자)'
              placeholderTextColor={colors['gray-600']}
              multiline
              maxLength={300}
              textAlignVertical='top'
              className='text-16r mb-[8px] min-h-[200px] rounded-[10px] border border-gray-300 bg-white px-[16px] py-[11px] focus:border-gray-600'
            />
            <View className='items-end'>
              <Text className='text-12r text-[#808087]'>{`${content.length}/300`}</Text>
            </View>
          </ScrollView>

          <View style={{ paddingBottom: insets.bottom }} className='mb-[18px]'>
            <AnimatedPressable
              onPress={handleSubmit}
              disabled={isPending || content.length < 10}
              className={`bg-primary-500 items-center rounded-[8px] py-[10px] ${
                isPending || content.length < 10 ? 'opacity-50' : ''
              }`}>
              <Text className='text-16m text-white'>보내기</Text>
            </AnimatedPressable>
          </View>
        </ContentInset>
      </ScreenLayout>
    </KeyboardAvoidingView>
  );
};

export default FeedbackScreen;
