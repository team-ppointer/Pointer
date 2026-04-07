import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GradeValue, MathSubjectValue } from '../constants';

type OnboardingStep = 'Grade' | 'MathSubject' | 'School' | 'Score' | 'Welcome';

type OnboardingStatus = 'idle' | 'in-progress' | 'completed';

type OnboardingState = {
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  grade: GradeValue | null;
  selectSubject: MathSubjectValue | null;
  schoolId: number | null;
  level: number | null;
};

export type OnboardingPayload = Omit<OnboardingState, 'status' | 'currentStep'>;

type OnboardingActions = {
  start: () => void;
  complete: () => void;
  reset: () => void;
  setCurrentStep: (step: OnboardingStep) => void;
  setGrade: (grade: GradeValue) => void;
  setSelectSubject: (subject: MathSubjectValue | null) => void;
  setSchoolId: (schoolId: number | null) => void;
  setLevel: (level: number | null) => void;
  getPayload: () => OnboardingPayload;
};

const initialState: OnboardingState = {
  status: 'idle',
  currentStep: 'Grade',
  grade: null,
  selectSubject: null,
  schoolId: null,
  level: null,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      start: () =>
        set({
          ...initialState,
          status: 'in-progress',
        }),

      complete: () =>
        set((state) => ({
          ...state,
          status: 'completed',
        })),

      reset: () => set(initialState),

      setCurrentStep: (step) => set({ currentStep: step }),

      setGrade: (grade) => set({ grade }),
      setSelectSubject: (selectSubject) => set({ selectSubject }),
      setSchoolId: (schoolId) => set({ schoolId }),
      setLevel: (level) => set({ level }),

      getPayload: () => {
        const { grade, selectSubject, schoolId, level } = get();
        return { grade, selectSubject, schoolId, level };
      },
    }),
    {
      name: 'onboarding-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
