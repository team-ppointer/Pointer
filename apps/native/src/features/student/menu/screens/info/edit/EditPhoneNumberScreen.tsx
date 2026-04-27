import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { CircleCheck, CircleAlert } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable, ContentInset, Header } from '@components/common';
import {
  useGetMe,
  usePutMe,
  postPhoneSend,
  postPhoneResend,
  postPhoneVerify,
  TanstackQueryClient,
} from '@apis';
import { type MenuStackParamList } from '@navigation/student/MenuNavigator';
import { colors } from '@theme/tokens';
import { showToast } from '@features/student/scrap/components/Notification';

const INPUT_STYLE = { lineHeight: 20, paddingVertical: 0 } as const;
const TIMER_CONTAINER_STYLE = {
  position: 'absolute' as const,
  right: 16,
  top: 0,
  height: 48,
  justifyContent: 'center' as const,
};

const EditPhoneNumberScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const { data } = useGetMe();

  const queryClient = useQueryClient();
  const { mutate: putMeMutate } = usePutMe();

  const [phoneNumber, setPhoneNumber] = useState(data?.phoneNumber || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyFeedbackMessage, setVerifyFeedbackMessage] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(120); // 2분 = 120초
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const resetVerificationSession = useCallback(() => {
    setIsCodeSent(false);
    setVerificationCode('');
    setVerifyFeedbackMessage(null);
    setExpiresAt(null);
    setTimer(0);
  }, []);

  useEffect(() => {
    if (!isCodeSent || expiresAt === null) {
      return;
    }

    const syncRemainingTime = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimer(remaining);
      if (remaining === 0) {
        resetVerificationSession();
      }
    };

    syncRemainingTime();
    const interval = setInterval(syncRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [isCodeSent, expiresAt, resetVerificationSession]);

  const handleSendCode = async () => {
    if (phoneNumber.length >= 2 && !phoneNumber.startsWith('01')) {
      showToast('error', '01로 시작하는 숫자를 입력해 주세요.');
      return;
    }
    if (phoneNumber.length !== 11) {
      showToast('error', '휴대폰 번호는 11자를 입력해 주세요.');
      return;
    }
    try {
      const response = await postPhoneSend(phoneNumber);
      if (response.data?.success) {
        setIsCodeSent(true);
        setVerificationCode('');
        setVerifyFeedbackMessage(null);
        setExpiresAt(Date.now() + 120 * 1000);
        setTimer(120);
        showToast('success', response.data.message || '인증번호가 전송되었습니다.');
      } else {
        showToast('error', response.data?.message || '인증번호 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to send verification code:', error);
      showToast('error', '인증번호 전송에 실패했습니다.');
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await postPhoneResend(phoneNumber);
      if (response.data?.success) {
        setIsCodeSent(true);
        setVerificationCode('');
        setVerifyFeedbackMessage(null);
        setExpiresAt(Date.now() + 120 * 1000);
        setTimer(120);
        showToast('success', response.data.message || '인증번호가 재전송되었습니다.');
      } else {
        showToast('error', response.data?.message || '인증번호 재전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to resend verification code:', error);
      showToast('error', '인증번호 재전송에 실패했습니다.');
    }
  };

  const handleVerifyCodeChange = (text: string) => {
    if (/^[0-9]*$/.test(text) && text.length <= 6) {
      setVerificationCode(text);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await postPhoneVerify(phoneNumber, verificationCode);
      if (response.data?.success) {
        // 인증 성공 시 휴대폰 번호 업데이트
        putMeMutate(
          { phoneNumber },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: TanstackQueryClient.queryOptions('get', '/api/student/me').queryKey,
              });
              showToast('success', '휴대폰 번호 변경이 완료되었습니다.');
              navigation.goBack();
            },
            onError: () => {
              showToast('error', '휴대폰 번호 변경에 실패했습니다.');
            },
          }
        );
      } else {
        setVerifyFeedbackMessage(response.data?.message || '인증번호를 다시 확인해주세요.');
      }
    } catch (error) {
      console.error('Failed to verify verification code:', error);
      showToast('error', (error as Error).message || '인증에 실패했습니다.');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isValidPhone = /^01\d{9}$/.test(phoneNumber);

  const getPhoneFeedbackMessage = (): string | null => {
    if (phoneNumber.length >= 2 && !phoneNumber.startsWith('01')) {
      return '01로 시작하는 숫자를 입력해 주세요.';
    }
    if (phoneNumber.length > 0 && phoneNumber.length !== 11) {
      return '휴대폰 번호는 11자를 입력해 주세요.';
    }
    return null;
  };

  const handlePhoneNumberChange = (text: string) => {
    const phoneRegex = /^[0-9]*$/;
    if (phoneRegex.test(text) && text.length <= 11) {
      setPhoneNumber(text);
    }
  };

  const phoneFeedback = getPhoneFeedbackMessage();

  return (
    <KeyboardAvoidingView
      className='w-full flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <Header showBackButton />
      <ContentInset className='flex-1'>
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          <View className='gap-[32px]'>
            <View className='gap-1'>
              <Text className='text-20b text-gray-800'>변경할 휴대폰 번호를 입력해 주세요.</Text>
              <Text className='text-16r text-gray-700'>
                인증이 완료되면 새로운 번호가 바로 적용돼요.
              </Text>
            </View>

            <View className='gap-[20px]'>
              <View className='gap-[6px]'>
                <Text className='text-14m text-gray-900'>휴대폰 번호</Text>
                <View className='flex-row items-center gap-[10px]'>
                  <TextInput
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    placeholder='01012345678'
                    placeholderTextColor={colors['gray-600']}
                    keyboardType='phone-pad'
                    style={INPUT_STYLE}
                    className={`text-16r h-[48px] flex-1 rounded-[10px] border bg-white px-4 text-black ${isCodeSent ? 'border-blue-500' : 'border-gray-300'}`}
                  />
                  {isCodeSent && (
                    <AnimatedPressable
                      disabled={timer > 0}
                      className='bg-primary-500 items-center justify-center rounded-[8px]'
                      style={{ width: 100, height: 48, opacity: timer > 0 ? 0.5 : 1 }}
                      onPress={handleResendCode}>
                      <Text className='text-16m text-white'>재전송</Text>
                    </AnimatedPressable>
                  )}
                </View>
                <View className='flex-row items-center gap-2'>
                  {isCodeSent ? (
                    <>
                      <CircleCheck color={colors['blue-500']} size={14} />
                      <Text className='text-12r text-blue-500'>문자로 인증번호를 전송했어요</Text>
                    </>
                  ) : (
                    <>
                      {phoneFeedback && <CircleAlert size={14} color={colors['red-500']} />}
                      <Text className='text-12r text-red-500'>{phoneFeedback}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            {isCodeSent && (
              <View className='gap-[6px]'>
                <Text className='text-14m text-gray-900'>인증번호</Text>
                <View className='w-full' style={{ position: 'relative' }}>
                  <TextInput
                    value={verificationCode}
                    onChangeText={handleVerifyCodeChange}
                    placeholder='인증번호 6자리'
                    keyboardType='number-pad'
                    maxLength={6}
                    style={INPUT_STYLE}
                    className='text-16r h-[48px] w-full rounded-[10px] border border-gray-300 bg-white px-4 pr-[60px] text-black'
                  />
                  <View style={TIMER_CONTAINER_STYLE}>
                    <Text className='text-14m text-primary-500'>{formatTime(timer)}</Text>
                  </View>
                </View>
                {verifyFeedbackMessage ? (
                  <View className='flex-row items-center gap-2'>
                    <CircleAlert size={14} color={colors['red-500']} />
                    <Text className='text-12r text-red-500'>{verifyFeedbackMessage}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={{ paddingBottom: insets.bottom }} className='mb-[10px]'>
          {!isCodeSent || timer === 0 ? (
            <AnimatedPressable
              onPress={handleSendCode}
              disabled={!isValidPhone}
              className={`bg-primary-500 items-center rounded-[8px] px-[12px] py-[10px] ${!isValidPhone ? 'opacity-50' : ''}`}>
              <Text className='text-16m text-white'>인증번호 받기</Text>
            </AnimatedPressable>
          ) : (
            <AnimatedPressable
              onPress={handleVerify}
              className='bg-primary-500 items-center rounded-[8px] px-[12px] py-[10px]'>
              <Text className='text-16m text-white'>인증 완료</Text>
            </AnimatedPressable>
          )}
        </View>
      </ContentInset>
    </KeyboardAvoidingView>
  );
};

export default EditPhoneNumberScreen;
