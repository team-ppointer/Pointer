import { useState } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { OnboardingLayout, OnboardingInput } from '../../components';
import { carrierOptions } from '../../constants';
import type { CarrierValue, GenderValue } from '../../constants';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';
import { colors } from '@/theme/tokens';

type FormState = {
  name: string;
  registrationFront: string;
  registrationBack: string;
  phone: string;
  carrier: CarrierValue | null;
};

const parseBirthDate = (registrationFront: string, registrationBack: string): string | null => {
  if (registrationFront.length !== 6 || registrationBack.length === 0) return null;

  const yy = registrationFront.slice(0, 2);
  const mm = registrationFront.slice(2, 4);
  const dd = registrationFront.slice(4, 6);
  const genderCode = registrationBack[0];

  // 1, 2 = 1900s, 3, 4 = 2000s
  const century = genderCode === '1' || genderCode === '2' ? '19' : '20';
  return `${century}${yy}-${mm}-${dd}`;
};

const parseGender = (registrationBack: string): GenderValue | null => {
  if (registrationBack.length === 0) return null;
  const genderCode = registrationBack[0];
  // 1, 3 = MALE, 2, 4 = FEMALE
  return genderCode === '1' || genderCode === '3' ? 'MALE' : 'FEMALE';
};

const IdentityStep = ({ navigation }: OnboardingScreenProps<'Identity'>) => {
  const identity = useOnboardingStore((state) => state.identity);
  const setIdentity = useOnboardingStore((state) => state.setIdentity);

  const [form, setForm] = useState<FormState>({
    name: identity.name,
    registrationFront: '',
    registrationBack: '',
    phone: identity.phoneNumber,
    carrier: identity.mobileCarrier,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [carrierModalVisible, setCarrierModalVisible] = useState(false);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name) nextErrors.name = '이름을 입력해 주세요.';
    if (form.registrationFront.length !== 6)
      nextErrors.registrationFront = '앞자리 6글자를 입력해 주세요.';
    if (form.registrationBack.length !== 7)
      nextErrors.registrationBack = '뒤 7자리를 입력해 주세요.';
    if (!/^010\d{7,8}$/.test(form.phone))
      nextErrors.phone = '010으로 시작하는 번호를 입력해 주세요.';
    if (!form.carrier) nextErrors.carrier = '통신사를 선택해 주세요.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    setIdentity({
      name: form.name,
      birth: parseBirthDate(form.registrationFront, form.registrationBack),
      gender: parseGender(form.registrationBack),
      phoneNumber: form.phone,
      mobileCarrier: form.carrier,
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

  const isFormComplete =
    Boolean(form.name) &&
    form.registrationFront.length === 6 &&
    form.registrationBack.length === 7 &&
    /^010\d{7,8}$/.test(form.phone) &&
    Boolean(form.carrier);

  const getCarrierLabel = (value: CarrierValue | null) => {
    if (!value) return '';
    return carrierOptions.find((opt) => opt.value === value)?.label ?? '';
  };

  return (
    <>
      <OnboardingLayout
        title='본인 인증을 해주세요.'
        description='포인터 사용을 위해 최초 1회 본인 인증이 필요해요.'
        onPressCTA={handleNext}
        ctaDisabled={!isFormComplete}
        onPressBack={handleBack}>
        <View className='gap-[18px]'>
          <OnboardingInput
            label='이름'
            placeholder='예) 홍길동'
            value={form.name}
            onChangeText={(text) => updateField('name', text)}
            errorMessage={errors.name}
          />
          <View>
            <Text className='text-16sb mb-[8px] text-gray-900'>주민등록번호</Text>
            <View className='flex-row items-center gap-[12px]'>
              <OnboardingInput
                value={form.registrationFront}
                onChangeText={(text) =>
                  updateField('registrationFront', text.replace(/[^0-9]/g, ''))
                }
                keyboardType='number-pad'
                maxLength={6}
                placeholder='앞자리 6글자'
                containerClassName='flex-1'
                errorMessage={errors.registrationFront}
              />
              <Text className='text-18b text-gray-600'>-</Text>
              <OnboardingInput
                value={form.registrationBack}
                onChangeText={(text) =>
                  updateField('registrationBack', text.replace(/[^0-9]/g, ''))
                }
                keyboardType='number-pad'
                secureTextEntry
                maxLength={7}
                placeholder='●●●●●●●'
                containerClassName='flex-1'
                errorMessage={errors.registrationBack}
              />
            </View>
          </View>
          <OnboardingInput
            label='휴대폰 번호'
            placeholder='01012345678'
            keyboardType='number-pad'
            maxLength={11}
            value={form.phone}
            onChangeText={(text) => updateField('phone', text.replace(/[^0-9]/g, ''))}
            errorMessage={errors.phone}
          />
          <View>
            <Text className='text-16sb mb-[8px] text-gray-900'>통신사</Text>
            <View className='relative'>
              <OnboardingInput
                value={getCarrierLabel(form.carrier)}
                placeholder='SKT, KT, LG U+, 알뜰폰'
                editable={false}
                rightAccessory={<ChevronDown color={colors['gray-900']} size={20} />}
                containerClassName='mb-0'
                errorMessage={errors.carrier}
              />
              <Pressable
                className='absolute inset-0'
                onPress={() => setCarrierModalVisible(true)}
              />
            </View>
          </View>
        </View>
      </OnboardingLayout>
      <Modal visible={carrierModalVisible} transparent animationType='fade'>
        <View className='flex-1 justify-end bg-black/20'>
          <Pressable className='flex-1' onPress={() => setCarrierModalVisible(false)} />
          <View className='rounded-t-[24px] bg-white px-[24px] pb-[32px] pt-[20px]'>
            <Text className='text-16sb mb-[12px] text-gray-900'>통신사를 선택해 주세요.</Text>
            {carrierOptions.map((carrier) => (
              <Pressable
                key={carrier.value}
                className='rounded-[12px] px-[12px] py-[12px]'
                onPress={() => {
                  updateField('carrier', carrier.value);
                  setCarrierModalVisible(false);
                }}>
                <Text className='text-16m text-gray-800'>{carrier.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default IdentityStep;
