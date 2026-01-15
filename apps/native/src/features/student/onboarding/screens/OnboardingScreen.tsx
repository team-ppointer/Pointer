import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import EmailStep from './steps/EmailStep';
import IdentityStep from './steps/IdentityStep';
import GradeStep from './steps/GradeStep';
import MathSubjectStep from './steps/MathSubjectStep';
import SchoolStep from './steps/SchoolStep';
import ScoreStep from './steps/ScoreStep';
import WelcomeStep from './steps/WelcomeStep';
import { useOnboardingStore } from '../store/useOnboardingStore';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingScreen = () => {
  // 이메일이 이미 설정되어 있으면 (이메일 로그인) Identity 스텝부터 시작
  const email = useOnboardingStore((state) => state.email);
  const initialRoute = email ? 'Identity' : 'Email';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name='Email' component={EmailStep} />
      <Stack.Screen name='Identity' component={IdentityStep} />
      <Stack.Screen name='Grade' component={GradeStep} />
      <Stack.Screen name='MathSubject' component={MathSubjectStep} />
      <Stack.Screen name='School' component={SchoolStep} />
      <Stack.Screen name='Score' component={ScoreStep} />
      <Stack.Screen name='Welcome' component={WelcomeStep} />
    </Stack.Navigator>
  );
};

export default OnboardingScreen;
