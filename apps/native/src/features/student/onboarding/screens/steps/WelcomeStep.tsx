import { View, Text } from 'react-native';

import { useAuthStore } from '@stores';
import postRegister from '@apis/controller/student/auth/postRegister';
import type { components } from '@schema';
import { useSignupStore } from '@features/auth/signup/store/useSignupStore';

import { MailBoxGraphic, OnboardingLayout } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

type StudentInitialRegisterReq = components['schemas']['StudentInitialRegisterDTO.Req'];

const WelcomeStep = (_props: OnboardingScreenProps<'Welcome'>) => {
  const getPayload = useOnboardingStore((state) => state.getPayload);
  const complete = useOnboardingStore((state) => state.complete);
  const step1Data = useSignupStore((state) => state.step1Data);
  const resetSignup = useSignupStore((state) => state.reset);

  const updateStudentProfile = useAuthStore((state) => state.updateStudentProfile);

  const handleFinish = async () => {
    const onboardingPayload = getPayload();

    const registerData: StudentInitialRegisterReq = {
      isGteFourteen: step1Data.terms.isGteFourteen,
      isAgreeServiceUsage: step1Data.terms.isAgreeServiceUsage,
      isAgreePersonalInformation: step1Data.terms.isAgreePersonalInformation,
      isAgreeReceiveMarketing: step1Data.terms.isAgreeReceiveMarketing,
      email: step1Data.email || undefined,
      name: step1Data.name,
      phoneNumber: step1Data.phoneNumber || undefined,
      grade: onboardingPayload.grade ?? 'ONE',
      selectSubject: onboardingPayload.selectSubject ?? undefined,
      schoolId: onboardingPayload.schoolId ?? undefined,
      level: onboardingPayload.level ?? undefined,
    };

    try {
      const { data, error } = await postRegister(registerData);

      if (error || !data) {
        console.error('[WelcomeStep] Registration failed:', error);
        return;
      }

      await updateStudentProfile({
        name: step1Data.name || null,
        grade: onboardingPayload.grade,
      });

      complete();
      resetSignup();
    } catch (error) {
      console.error('[WelcomeStep] Registration exception:', error);
    }
  };

  return (
    <OnboardingLayout onPressCTA={handleFinish} ctaLabel='다음' isScrollable={false}>
      <View className='h-full items-center justify-center'>
        <MailBoxGraphic />
        <Text className='text-20b mt-[20px] text-center text-gray-800'>
          환영합니다! 바로 시작해볼까요?
        </Text>
        <Text className='text-16r mt-[12px] text-center text-gray-700'>
          매일 배달되는 맞춤형 문제를 풀고{'\n'}
          나만의 수학 노트를 만들어 수학 등급을 올려요!
        </Text>
      </View>
    </OnboardingLayout>
  );
};

export default WelcomeStep;
