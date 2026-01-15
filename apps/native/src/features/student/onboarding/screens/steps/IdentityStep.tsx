import { useState } from 'react';
import { Alert } from 'react-native';
import { OnboardingLayout, OnboardingInput } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

type FormState = {
  name: string;
  phone: string;
};

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

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name) nextErrors.name = '이름을 입력해 주세요.';
    if (!/^010\d{7,8}$/.test(form.phone))
      nextErrors.phone = '010으로 시작하는 번호를 입력해 주세요.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

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

  const isFormComplete = Boolean(form.name) && /^010\d{7,8}$/.test(form.phone);

  return (
    <OnboardingLayout
      title='본인 인증을 해주세요.'
      description='포인터 사용을 위해 최초 1회 본인 인증이 필요해요.'
      onPressCTA={handleNext}
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
      <OnboardingInput
        label='휴대폰 번호'
        placeholder='01012345678'
        keyboardType='number-pad'
        maxLength={11}
        value={form.phone}
        onChangeText={(text) => updateField('phone', text.replace(/[^0-9]/g, ''))}
        errorMessage={errors.phone}
        containerClassName='mt-[18px]'
      />
    </OnboardingLayout>
  );
};

export default IdentityStep;
