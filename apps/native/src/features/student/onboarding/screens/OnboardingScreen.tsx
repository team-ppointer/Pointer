import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import EmailStep from './steps/EmailStep';
import IdentityStep from './steps/IdentityStep';
import GradeStep from './steps/GradeStep';
import MathSubjectStep from './steps/MathSubjectStep';
import SchoolStep from './steps/SchoolStep';
import ScoreStep from './steps/ScoreStep';
import NicknameStep from './steps/NicknameStep';
import WelcomeStep from './steps/WelcomeStep';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingScreen = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name='Email' component={EmailStep} />
      <Stack.Screen name='Identity' component={IdentityStep} />
      <Stack.Screen name='Grade' component={GradeStep} />
      <Stack.Screen name='MathSubject' component={MathSubjectStep} />
      <Stack.Screen name='School' component={SchoolStep} />
      <Stack.Screen name='Score' component={ScoreStep} />
      <Stack.Screen name='Nickname' component={NicknameStep} />
      <Stack.Screen name='Welcome' component={WelcomeStep} />
    </Stack.Navigator>
  );
};

export default OnboardingScreen;
