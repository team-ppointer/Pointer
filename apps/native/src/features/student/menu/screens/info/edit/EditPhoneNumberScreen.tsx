import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CircleCheck, CircleAlert } from 'lucide-react-native';
import { useGetMe, usePutMe, postPhoneSend, postPhoneResend, postPhoneVerify } from '@apis';
import { MenuStackParamList } from '@navigation/student/MenuNavigator';
import { colors } from '@theme/tokens';
import { carrierOptions, type CarrierValue } from '@features/student/onboarding/constants';
import { showToast } from '@features/student/scrap/components/Notification';
import { EditScreenLayout } from '@features/student/menu/components/EditScreenLayout';

const EditPhoneNumberScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const { data } = useGetMe();

  const { mutate: putMeMutate } = usePutMe();

  const [phoneNumber, setPhoneNumber] = useState(data?.phoneNumber || '');
  const [carrier, setCarrier] = useState<CarrierValue | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyFeedbackMessage, setVerifyFeedbackMessage] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  // const [carrierModalVisible, setCarrierModalVisible] = useState(false);
  const [timer, setTimer] = useState(120);
  const [endTime, setEndTime] = useState<number | null>(null);

  useEffect(() => {
    if (isCodeSent) {
      const expires = Date.now() + 120 * 1000;
      setEndTime(expires);
      setTimer(120);
    }
  }, [isCodeSent]);

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

      setTimer(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        // 여기서 인증 만료 처리해도 됨
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

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

  // const getCarrierLabel = (value: CarrierValue | null) => {
  //   if (!value) return '';
  //   return carrierOptions.find((opt) => opt.value === value)?.label ?? '';
  // };

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

  return (
    <EditScreenLayout
      title='변경할 휴대폰 번호를 입력해 주세요.'
      description='인증이 완료되면 새로운 번호가 바로 적용돼요.'
      ctaLabel={!isCodeSent || timer === 0 ? '인증번호 받기' : '인증 완료'}
      ctaDisabled={(!isCodeSent || timer === 0) && !isValidPhone}
      onPressCTA={!isCodeSent || timer === 0 ? handleSendCode : handleVerify}
      onPressBack={() => navigation.goBack()}
      contentClassName='gap-[20px]'>
      <View className='gap-[6px]'>
        <Text className='text-14m text-gray-900'>휴대폰 번호</Text>
        <View className='flex-row items-center gap-[10px]'>
          <TextInput
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            placeholder='01012345678'
            placeholderTextColor={colors['gray-600']}
            keyboardType='phone-pad'
            style={{ lineHeight: 20, paddingVertical: 0 }}
            className={`text-16r h-[48px] flex-1 rounded-[10px] border bg-white px-4 text-black ${isCodeSent ? 'border-blue-500' : 'border-gray-300'}`}
          />
          {isCodeSent && (
            <Pressable
              disabled={timer > 0}
              className='bg-primary-500 items-center justify-center rounded-[8px]'
              style={{ width: 100, height: 48, opacity: timer > 0 ? 0.5 : 1 }}
              onPress={handleResendCode}>
              <Text className='text-16m text-white'>재전송</Text>
            </Pressable>
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
              {getPhoneFeedbackMessage() && <CircleAlert size={14} color={colors['red-500']} />}
              <Text className='text-12r text-red-500'>{getPhoneFeedbackMessage()}</Text>
            </>
          )}
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
              style={{ lineHeight: 20, paddingVertical: 0 }}
              className='text-16r h-[48px] w-full rounded-[10px] border border-gray-300 bg-white px-4 pr-[60px] text-black'
            />
            <View
              style={{
                position: 'absolute',
                right: 16,
                top: 0,
                height: 48,
                justifyContent: 'center',
              }}>
              <Text className='text-14m text-primary-500'>{formatTime(timer)}</Text>
            </View>
          </View>
          {verifyFeedbackMessage && (
            <View className='flex-row items-center gap-2'>
              <CircleAlert size={14} color={colors['red-500']} />
              <Text className='text-12r text-red-500'>{verifyFeedbackMessage}</Text>
            </View>
          )}
        </View>
      )}
    </EditScreenLayout>
  );
};

export default EditPhoneNumberScreen;
