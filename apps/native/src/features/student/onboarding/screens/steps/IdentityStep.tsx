import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Text, View } from 'react-native';

import postPhoneResend from '@/apis/controller/common/auth/postPhoneResend';
import postPhoneSend from '@/apis/controller/common/auth/postPhoneSend';
import postPhoneVerify from '@/apis/controller/common/auth/postPhoneVerify';
import { AnimatedPressable } from '@components/common';

import { OnboardingLayout, OnboardingInput } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

type FormState = {
  name: string;
  phone: string;
};

const phoneRegex = /^010\d{8}$/;

const IdentityStep = ({ navigation }: OnboardingScreenProps<'Identity'>) => {
  const email = useOnboardingStore((state) => state.email);
  const identity = useOnboardingStore((state) => state.identity);
  const setIdentity = useOnboardingStore((state) => state.setIdentity);

  // 이메일이 이미 설정되어 있으면 (이메일 로그인) 뒤로가기 숨김
  const isEmailLogin = Boolean(email);

  const [form, setForm] = useState<FormState>({
    name: identity.name,
    phone: identity.phoneNumber,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auth states
  const [isSent, setIsSent] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const deadlineRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdownInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const syncTimeLeft = useCallback(() => {
    if (deadlineRef.current === 0) return;
    const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
    setTimeLeft(remaining);
    if (remaining <= 0) {
      deadlineRef.current = 0;
      clearCountdownInterval();
    }
  }, [clearCountdownInterval]);

  const startCountdown = useCallback(
    (durationSeconds: number) => {
      clearCountdownInterval();
      deadlineRef.current = Date.now() + durationSeconds * 1000;
      setTimeLeft(durationSeconds);
      intervalRef.current = setInterval(syncTimeLeft, 1000);
    },
    [clearCountdownInterval, syncTimeLeft]
  );

  const resetCountdown = useCallback(() => {
    clearCountdownInterval();
    deadlineRef.current = 0;
    setTimeLeft(0);
  }, [clearCountdownInterval]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncTimeLeft();
    });
    return () => {
      subscription.remove();
      clearCountdownInterval();
    };
  }, [syncTimeLeft, clearCountdownInterval]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    if (key === 'phone') {
      setIsSent(false);
      setVerifyCode('');
      resetCountdown();
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name) nextErrors.name = '이름을 입력해 주세요.';
    if (!phoneRegex.test(form.phone)) nextErrors.phone = '010으로 시작하는 번호를 입력해 주세요.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!validate()) return;

    const { error } = await postPhoneSend(form.phone, 'signup');
    if (error) {
      Alert.alert('오류', '인증번호 전송에 실패했습니다.');
      return;
    }
    setIsSent(true);
    startCountdown(180);
  };

  const handleResend = async () => {
    const { error } = await postPhoneResend(form.phone, 'signup');
    if (error) {
      Alert.alert('오류', '인증번호 재전송에 실패했습니다.');
      return;
    }
    startCountdown(180);
  };

  const handleVerify = async () => {
    if (!verifyCode) {
      Alert.alert('알림', '인증번호를 입력해주세요.');
      return;
    }

    const { error } = await postPhoneVerify(form.phone, verifyCode, 'signup');
    if (error) {
      Alert.alert('인증 실패', '인증번호가 일치하지 않습니다.');
      return;
    }

    // Success
    setIdentity({
      name: form.name,
      phoneNumber: form.phone,
    });
    navigation.navigate('Grade');
  };

  const handleBack = () => {
    Alert.alert('번호 인증을 종료할까요?', '이 페이지를 나가면 자동 로그아웃 돼요.', [
      {
        text: '아니요',
        style: 'cancel',
      },
      {
        text: '네',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const isFormComplete = isSent
    ? Boolean(form.name) && phoneRegex.test(form.phone) && Boolean(verifyCode)
    : Boolean(form.name) && phoneRegex.test(form.phone);

  return (
    <OnboardingLayout
      title='본인 인증을 해주세요.'
      description='포인터 사용을 위해 최초 1회 본인 인증이 필요해요.'
      onPressCTA={isSent ? handleVerify : handleSend}
      ctaLabel={isSent ? '인증 완료하기' : '인증번호 발송'}
      ctaDisabled={!isFormComplete}
      showBackButton={!isEmailLogin}
      onPressBack={handleBack}>
      <OnboardingInput
        label='이름'
        placeholder='예) 홍길동'
        value={form.name}
        onChangeText={(text) => updateField('name', text)}
        errorMessage={errors.name}
      />
      <View className='flex-row items-start gap-[10px]'>
        <OnboardingInput
          label='휴대폰 번호'
          placeholder='01012345678'
          keyboardType='number-pad'
          maxLength={11}
          value={form.phone}
          onChangeText={(text) => updateField('phone', text.replace(/[^0-9]/g, ''))}
          errorMessage={errors.phone}
          successMessage={isSent ? '문자로 인증번호를 전송했어요.' : ''}
          containerClassName='mt-[18px] flex-1'
        />
        {isSent && (
          <AnimatedPressable
            onPress={timeLeft > 0 ? undefined : handleResend}
            disabled={timeLeft > 0}
            className='bg-primary-500 mt-[45px] h-[48px] w-[100px] items-center justify-center rounded-[8px]'>
            <Text className='text-16m text-white'>
              {timeLeft > 0 ? formatTime(timeLeft) : isSent ? '재전송' : '인증 요청'}
            </Text>
          </AnimatedPressable>
        )}
      </View>
      {isSent && (
        <OnboardingInput
          label='인증번호'
          placeholder='000000'
          keyboardType='number-pad'
          maxLength={6}
          value={verifyCode}
          onChangeText={setVerifyCode}
          containerClassName='mt-[18px]'
        />
      )}
    </OnboardingLayout>
  );
};

export default IdentityStep;
