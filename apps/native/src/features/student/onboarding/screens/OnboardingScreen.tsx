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
  useFetchCurrentMockExamType();

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
