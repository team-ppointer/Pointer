import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type OnboardingStackParamList = {
  Grade: undefined;
  MathSubject: undefined;
  School: undefined;
  MockExam: undefined;
  Welcome: undefined;
};

export type OnboardingStep = keyof OnboardingStackParamList;

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;
