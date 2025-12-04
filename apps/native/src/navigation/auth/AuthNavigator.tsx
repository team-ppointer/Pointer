import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '@features/auth/login';

export type AuthStackParamList = {
  Login: undefined;
  // Onboarding: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Login' component={LoginScreen} />
      {/* <Stack.Screen name='Onboarding' component={OnboardingScreen} /> */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
