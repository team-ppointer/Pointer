import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type OnboardingStackParamList = {
  Email: undefined;
  Identity: undefined;
  Grade: undefined;
  MathSubject: undefined;
  School: undefined;
  Score: undefined;
  Welcome: undefined;
};

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;
