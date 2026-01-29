import { create } from 'zustand';
import type { GradeValue, MathSubjectValue } from '../constants';

type IdentityInfo = {
  name: string;
  phoneNumber: string;
};

type OnboardingStatus = 'idle' | 'in-progress' | 'completed';

type OnboardingState = {
  status: OnboardingStatus;
  email: string;
  identity: IdentityInfo;
  grade: GradeValue | null;
  selectSubject: MathSubjectValue | null;
  schoolId: number | null;
  level: number | null;
};

export type OnboardingPayload = Omit<OnboardingState, 'status'>;

type OnboardingActions = {
  start: (email?: string) => void;
  complete: () => void;
  reset: () => void;
  setEmail: (email: string) => void;
  setIdentity: (payload: Partial<IdentityInfo>) => void;
  setGrade: (grade: GradeValue) => void;
  setSelectSubject: (subject: MathSubjectValue) => void;
  setSchoolId: (schoolId: number | null) => void;
  setLevel: (level: number | null) => void;
  getPayload: () => OnboardingPayload;
};

const emptyIdentity: IdentityInfo = {
  name: '',
  phoneNumber: '',
};

const initialState: OnboardingState = {
  status: 'idle',
  email: '',
  identity: emptyIdentity,
  grade: null,
  selectSubject: null,
  schoolId: null,
  level: null,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>((set, get) => ({
  ...initialState,
  start: (email?: string) =>
    set(() => ({
      ...initialState,
      status: 'in-progress',
      email: email ?? '',
    })),
  complete: () =>
    set((state) => ({
      ...state,
      status: 'completed',
    })),
  reset: () => set(initialState),
  setEmail: (email) => set({ email }),
  setIdentity: (payload) =>
    set((state) => ({
      identity: {
        ...state.identity,
        ...payload,
      },
    })),
  setGrade: (grade) => set({ grade }),
  setSelectSubject: (selectSubject) => set({ selectSubject }),
  setSchoolId: (schoolId) => set({ schoolId }),
  setLevel: (level) => set({ level }),
  getPayload: () => {
    const { status: _status, ...payload } = get();
    return payload;
  },
}));
