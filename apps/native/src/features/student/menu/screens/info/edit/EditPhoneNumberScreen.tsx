import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container } from '@components/common';
import { ChevronLeft, ChevronDown, CircleCheck } from 'lucide-react-native';
import { useGetMe, usePutMe, postPhoneSend, postPhoneResend, postPhoneVerify } from '@apis';
import { MenuStackParamList } from '@navigation/student/MenuNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme/tokens';
import { carrierOptions, type CarrierValue } from '@features/student/onboarding/constants';
import { showToast } from '@features/student/scrap/components/Notification';

const EditPhoneNumberScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const { data } = useGetMe();

  const { mutate: putMeMutate } = usePutMe();

  const [phoneNumber, setPhoneNumber] = useState(data?.phoneNumber || '');
  const [carrier, setCarrier] = useState<CarrierValue | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [carrierModalVisible, setCarrierModalVisible] = useState(false);
  const [timer, setTimer] = useState(120); // 2분 = 120초

  useEffect(() => {
    if (isCodeSent && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCodeSent, timer]);

  const handleSendCode = async () => {
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

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showToast('error', '인증번호 6자리를 입력해주세요.');
      return;
    }

    try {
      const response = await postPhoneVerify(phoneNumber, verificationCode);
      if (response.data?.success) {
        const verifyMessage = response.data.message || '인증이 완료되었습니다.';
        // 인증 성공 시 휴대폰 번호 업데이트
        putMeMutate(
          { phoneNumber },
          {
            onSuccess: () => {
              showToast('success', verifyMessage);
              navigation.goBack();
            },
            onError: () => {
              showToast('error', '휴대폰 번호 변경에 실패했습니다.');
            },
          }
        );
      } else {
        showToast('error', response.data?.message || '인증에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to verify verification code:', error);
      showToast('error', '인증에 실패했습니다.');
    }
  };

  const getCarrierLabel = (value: CarrierValue | null) => {
    if (!value) return '';
    return carrierOptions.find((opt) => opt.value === value)?.label ?? '';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePhoneNumberChange = (text: string) => {
    const phoneRegex = /^[0-9]*$/;
    if (phoneRegex.test(text) && text.length <= 11) {
      setPhoneNumber(text);
    }
  };

  return (
    <KeyboardAvoidingView
      className='w-full flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <SafeAreaView edges={['top']} className='flex-row items-center justify-between px-5 py-1'>
        <Pressable onPress={() => navigation.goBack()} className='p-2'>
          <ChevronLeft size={32} color='#000' />
        </Pressable>
      </SafeAreaView>
      <Container className='flex-1'>
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          <View className='gap-[32px]'>
            <View className='gap-1'>
              <Text className='text-20b text-gray-800'>변경할 휴대폰 번호를 입력해 주세요.</Text>
              <Text className='text-16r  text-gray-700'>
                인증이 완료되면 새로운 번호가 바로 적용돼요.
              </Text>
            </View>

            <View className='gap-[20px]'>
              <View className='gap-[6px]'>
                <Text className='text-14m  text-gray-900'>휴대폰 번호</Text>
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
                      className='bg-primary-500 items-center justify-center rounded-[8px]'
                      style={{ width: 100, height: 48 }}
                      onPress={handleResendCode}>
                      <Text className='text-16m text-white'>재전송</Text>
                    </Pressable>
                  )}
                </View>
                {isCodeSent && (
                  <View className='flex-row items-center gap-2'>
                    <CircleCheck color={colors['blue-500']} size={14} />
                    <Text className='text-12r text-blue-500'>문자로 인증번호를 전송했어요</Text>
                  </View>
                )}
              </View>
              {/* <View className='gap-[10px]'>
              <View className='gap-[6px]'>
                <Text className='text-14m  text-gray-900'>통신사</Text>
                <View className='relative'>
                  <Pressable
                    onPress={() => setCarrierModalVisible(true)}
                    className='text-16r h-[48px] flex-row items-center justify-between rounded-[10px] border border-gray-300 bg-white px-4 py-[11px]'>
                    <Text
                      className='text-16r'
                      style={{ color: carrier ? colors.black : colors['gray-600'] }}>
                      {getCarrierLabel(carrier) || 'SKT, KT, LG U+, 알뜰폰'}
                    </Text>
                    <ChevronDown color={colors['gray-900']} size={20} />
                  </Pressable>
                </View>
              </View> */}
            </View>

            {isCodeSent && (
              <View className='gap-[6px]'>
                <Text className='text-14m  text-gray-900'>인증번호</Text>
                <View className='w-full' style={{ position: 'relative' }}>
                  <TextInput
                    value={verificationCode}
                    onChangeText={setVerificationCode}
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
              </View>
            )}
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} className='mb-[10px]'>
          {!isCodeSent || timer == 0 ? (
            <Pressable
              onPress={handleSendCode}
              disabled={phoneNumber.length !== 11}
              className={`bg-primary-500 items-center rounded-[8px] px-[12px] py-[10px] ${phoneNumber.length !== 11 ? 'opacity-50' : ''}`}>
              <Text className='text-16m text-white'>인증번호 받기</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleVerify}
              className='bg-primary-500 items-center rounded-[8px] px-[12px] py-[10px]'>
              <Text className='text-16m text-white'>인증 완료</Text>
            </Pressable>
          )}
        </SafeAreaView>
      </Container>

      {/* <Modal visible={carrierModalVisible} transparent animationType='fade'>
        <View className='flex-1 justify-end bg-black/20'>
          <Pressable className='flex-1' onPress={() => setCarrierModalVisible(false)} />
          <View className='rounded-t-[24px] bg-white px-[24px] pb-[32px] pt-[20px]'>
            <Text className='text-16sb mb-[12px] text-gray-900'>통신사를 선택해 주세요.</Text>
            {carrierOptions.map((carrierOption) => (
              <Pressable
                key={carrierOption.value}
                className='rounded-[12px] px-[12px] py-[12px]'
                onPress={() => {
                  setCarrier(carrierOption.value);
                  setCarrierModalVisible(false);
                }}>
                <Text className='text-16m text-gray-800'>{carrierOption.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal> */}
    </KeyboardAvoidingView>
  );
};

export default EditPhoneNumberScreen;
