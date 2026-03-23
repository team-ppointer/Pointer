import { View, Text } from 'react-native';
import { useAuthStore } from '@stores';
import postRegister from '@apis/controller/student/auth/postRegister';
import type { components } from '@schema';

import { MailBoxGraphic, OnboardingLayout } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

type StudentInitialRegisterReq = components['schemas']['StudentInitialRegisterDTO.Req'];

const WelcomeStep = (_props: OnboardingScreenProps<'Welcome'>) => {
  const getPayload = useOnboardingStore((state) => state.getPayload);
  const complete = useOnboardingStore((state) => state.complete);

  const updateStudentProfile = useAuthStore((state) => state.updateStudentProfile);

  const handleFinish = async () => {
    const payload = getPayload();
    console.log('[WelcomeStep] handleFinish called, payload:', payload);

    const registerData: StudentInitialRegisterReq = {
      isGteFourteen: true,
      isAgreeServiceUsage: true,
      isAgreePersonalInformation: true,
      isAgreeReceiveMarketing: false,
      email: payload.email || undefined,
      name: payload.identity.name,
      phoneNumber: payload.identity.phoneNumber || undefined,
      grade: payload.grade ?? 'ONE',
      selectSubject: payload.selectSubject ?? undefined,
      schoolId: payload.schoolId ?? undefined,
      level: payload.level ?? undefined,
    };
    console.log('[WelcomeStep] Sending registerData:', registerData);

    try {
      const { data, error } = await postRegister(registerData);
      console.log('[WelcomeStep] postRegister response - data:', data, 'error:', error);

      if (error || !data) {
        console.error('[WelcomeStep] Registration failed:', error);
        return;
      }

      await updateStudentProfile({
        name: payload.identity.name || null,
        grade: payload.grade,
      });
      console.log('[WelcomeStep] Profile updated, calling complete()');
      complete();
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
