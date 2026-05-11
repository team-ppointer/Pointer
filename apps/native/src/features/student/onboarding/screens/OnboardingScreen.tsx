import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useFetchCurrentMockExamType from '../hooks/useFetchCurrentMockExamType';
import { useOnboardingStore } from '../store/useOnboardingStore';

import type { OnboardingStackParamList } from './types';
import GradeStep from './steps/GradeStep';
import MathSubjectStep from './steps/MathSubjectStep';
import SchoolStep from './steps/SchoolStep';
import MockExamStep from './steps/MockExamStep';
import WelcomeStep from './steps/WelcomeStep';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingScreen = () => {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const status = useOnboardingStore((state) => state.status);
  const markStarted = useOnboardingStore((state) => state.markStarted);
  useFetchCurrentMockExamType();

  // status='idle'이면 onboarding 진입 시 'in-progress'로 전환하여
  // StudentNavigator의 routing이 register 후 grade 채워졌을 때 즉시 home으로
  // 자동 전환되는 것을 막는다 (WelcomeStep까지 머묾).
  useEffect(() => {
    if (status === 'idle') markStarted();
  }, [status, markStarted]);

  return (
    <Stack.Navigator
      initialRouteName={currentStep}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name='Grade' component={GradeStep} />
      <Stack.Screen name='MathSubject' component={MathSubjectStep} />
      <Stack.Screen name='School' component={SchoolStep} />
      <Stack.Screen name='MockExam' component={MockExamStep} />
      <Stack.Screen name='Welcome' component={WelcomeStep} />
    </Stack.Navigator>
  );
};

export default OnboardingScreen;
