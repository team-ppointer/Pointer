import { View, Text } from 'react-native';
import { MailBoxGraphic, OnboardingLayout } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';
import { useAuthStore } from '@stores';
import postRegister from '@apis/controller/student/auth/postRegister';
import type { components } from '@schema';

type StudentInitialRegisterReq = components['schemas']['StudentInitialRegisterDTO.Req'];

const WelcomeStep = (_props: OnboardingScreenProps<'Welcome'>) => {
  const getPayload = useOnboardingStore((state) => state.getPayload);
  const complete = useOnboardingStore((state) => state.complete);

  const updateStudentProfile = useAuthStore((state) => state.updateStudentProfile);

  const handleFinish = async () => {
    const payload = getPayload();

    const registerData: StudentInitialRegisterReq = {
      isGteFourteen: true,
      isAgreeServiceUsage: true,
      isAgreePersonalInformation: true,
      isAgreeReceiveMarketing: false,
      email: payload.email || undefined,
      name: payload.identity.name || payload.nickname,
      birth: payload.identity.birth ?? undefined,
      gender: payload.identity.gender ?? undefined,
      phoneNumber: payload.identity.phoneNumber || undefined,
      mobileCarrier: payload.identity.mobileCarrier ?? undefined,
      grade: payload.grade ?? 'ONE',
      selectSubject: payload.selectSubject ?? undefined,
      schoolId: payload.schoolId ?? undefined,
      level: payload.level ?? undefined,
      nickname: payload.nickname || undefined,
    };

    try {
      const response = await postRegister(registerData);

      if (response.data) {
        await updateStudentProfile({
          name: payload.identity.name || payload.nickname || null,
          grade: payload.grade,
        });
        complete();
      }
    } catch (error) {
      console.error('Registration failed:', error);
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
