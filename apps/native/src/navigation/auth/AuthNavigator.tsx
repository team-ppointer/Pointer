import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '@features/auth/login';
import {
  EmailInputScreen,
  EmailLoginScreen,
  SignupPasswordScreen,
  SignupEmailScreen,
  SignupTermsScreen,
  SignupIdentityScreen,
  ForgotEmailScreen,
  ForgotCodeScreen,
  ForgotResetScreen,
} from '@features/auth/signup';
import { useSignupStore } from '@features/auth/signup/store/useSignupStore';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';
import { useAuthStore } from '@stores';

export type AuthStackParamList = {
  Login: undefined;

  // 이메일 로그인
  EmailInput: undefined;
  EmailLogin: { email: string };

  // 비밀번호 찾기
  ForgotEmail: { email: string };
  ForgotCode: { email: string };
  ForgotReset: { email: string; code: string };

  // 회원가입 (소셜/이메일 공통)
  SignupPassword: { email: string };
  SignupEmail: undefined;
  SignupTerms: undefined;
  SignupIdentity: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** authenticated + signup 진행 중일 때 store 상태로 초기 화면 결정 */
const getSignupInitialRoute = (): keyof AuthStackParamList => {
  const { step1Data } = useSignupStore.getState();

  if (!step1Data.terms.isAgreeServiceUsage) {
    return step1Data.email ? 'SignupTerms' : 'SignupEmail';
  }

  return 'SignupIdentity';
};

const AuthNavigator = () => {
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const onboardingStatus = useOnboardingStore((s) => s.status);
  const step1Completed = useSignupStore((s) => s.step1Completed);

  const isSignupInProgress =
    sessionStatus === 'authenticated' && onboardingStatus === 'in-progress' && !step1Completed;

  const initialRouteName = isSignupInProgress ? getSignupInitialRoute() : 'Login';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name='Login' component={LoginScreen} />

      {/* 이메일 로그인 */}
      <Stack.Screen name='EmailInput' component={EmailInputScreen} />
      <Stack.Screen name='EmailLogin' component={EmailLoginScreen} />

      {/* 비밀번호 찾기 */}
      <Stack.Screen name='ForgotEmail' component={ForgotEmailScreen} />
      <Stack.Screen name='ForgotCode' component={ForgotCodeScreen} />
      <Stack.Screen name='ForgotReset' component={ForgotResetScreen} />

      {/* 회원가입 */}
      <Stack.Screen name='SignupPassword' component={SignupPasswordScreen} />
      <Stack.Screen name='SignupEmail' component={SignupEmailScreen} />
      <Stack.Screen name='SignupTerms' component={SignupTermsScreen} />
      <Stack.Screen name='SignupIdentity' component={SignupIdentityScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
