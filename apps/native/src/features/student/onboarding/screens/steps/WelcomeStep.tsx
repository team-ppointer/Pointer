import { View, Text } from 'react-native';

import { useSignupStore } from '@features/auth/signup/store/useSignupStore';

import { MailBoxGraphic, OnboardingLayout } from '../../components';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

const WelcomeStep = (_props: OnboardingScreenProps<'Welcome'>) => {
  const complete = useOnboardingStore((state) => state.complete);
  const resetSignup = useSignupStore((state) => state.reset);

  const handleFinish = () => {
    complete();
    resetSignup();
  };

  return (
    <OnboardingLayout
      onPressCTA={handleFinish}
      ctaLabel='시작하기'
      isScrollable={false}
      showBackButton={false}>
      <View className='h-full items-center justify-center'>
        <MailBoxGraphic />
        <Text className='typo-title-2-bold mt-[20px] text-center text-gray-800'>
          환영합니다! 바로 시작해볼까요?
        </Text>
        <Text className='typo-body-1-regular mt-[12px] text-center text-gray-700'>
          매일 배달되는 맞춤형 문제를 풀고{'\n'}
          나만의 수학 노트를 만들어 수학 등급을 올려요!
        </Text>
      </View>
    </OnboardingLayout>
  );
};

export default WelcomeStep;
