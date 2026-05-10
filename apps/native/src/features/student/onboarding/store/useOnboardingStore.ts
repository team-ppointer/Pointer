import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { components } from '@schema';

import type { GradeValue, MathSubjectValue } from '../constants';

type MockExamTypeResp = components['schemas']['MockExamTypeResp'];

type OnboardingStep = 'Grade' | 'MathSubject' | 'School' | 'MockExam' | 'Welcome';

type OnboardingStatus = 'idle' | 'in-progress' | 'completed';

type CurrentTypeStatus = 'idle' | 'loading' | 'resolved';

type OnboardingState = {
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  grade: GradeValue | null;
  selectSubject: MathSubjectValue | null;
  schoolId: number | null;
  currentMockExamType: MockExamTypeResp | null;
  currentTypeStatus: CurrentTypeStatus;
  mockExamIncorrects: number[];
  mockExamQuestion: string;
};

export type OnboardingPayload = Pick<OnboardingState, 'grade' | 'selectSubject' | 'schoolId'>;

type OnboardingActions = {
  start: () => void;
  complete: () => void;
  reset: () => void;
  setCurrentStep: (step: OnboardingStep) => void;
  setGrade: (grade: GradeValue) => void;
  setSelectSubject: (subject: MathSubjectValue | null) => void;
  setSchoolId: (schoolId: number | null) => void;
  setCurrentMockExamType: (type: MockExamTypeResp | null) => void;
  setCurrentTypeStatus: (status: CurrentTypeStatus) => void;
  toggleMockExamIncorrect: (n: number) => void;
  setMockExamQuestion: (question: string) => void;
  resetMockExam: () => void;
  getPayload: () => OnboardingPayload;
};

const initialMockExamState = {
  currentMockExamType: null,
  currentTypeStatus: 'idle' as CurrentTypeStatus,
  mockExamIncorrects: [] as number[],
  mockExamQuestion: '',
};

const initialState: OnboardingState = {
  status: 'idle',
  currentStep: 'Grade',
  grade: null,
  selectSubject: null,
  schoolId: null,
  ...initialMockExamState,
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

      setCurrentMockExamType: (currentMockExamType) => set({ currentMockExamType }),
      setCurrentTypeStatus: (currentTypeStatus) => set({ currentTypeStatus }),
      toggleMockExamIncorrect: (n) =>
        set((state) => ({
          mockExamIncorrects: state.mockExamIncorrects.includes(n)
            ? state.mockExamIncorrects.filter((v) => v !== n)
            : [...state.mockExamIncorrects, n],
        })),
      setMockExamQuestion: (mockExamQuestion) => set({ mockExamQuestion }),
      resetMockExam: () => set(initialMockExamState),

      getPayload: () => {
        const { grade, selectSubject, schoolId } = get();
        return { grade, selectSubject, schoolId };
      },
    }),
    {
      name: 'onboarding-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        grade: state.grade,
        selectSubject: state.selectSubject,
        schoolId: state.schoolId,
        currentStep: state.currentStep,
      }),
    }
  )
);
