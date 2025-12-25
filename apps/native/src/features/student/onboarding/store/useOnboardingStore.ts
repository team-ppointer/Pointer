import { create } from 'zustand';
import type { CarrierValue, GenderValue, GradeValue, MathSubjectValue } from '../constants';

type IdentityInfo = {
  name: string;
  birth: string | null; // YYYY-MM-DD format
  gender: GenderValue | null;
  phoneNumber: string;
  mobileCarrier: CarrierValue | null;
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
  nickname: string;
};

export type OnboardingPayload = Omit<OnboardingState, 'status'>;

type OnboardingActions = {
  start: () => void;
  complete: () => void;
  reset: () => void;
  setEmail: (email: string) => void;
  setIdentity: (payload: Partial<IdentityInfo>) => void;
  setGrade: (grade: GradeValue) => void;
  setSelectSubject: (subject: MathSubjectValue) => void;
  setSchoolId: (schoolId: number | null) => void;
  setLevel: (level: number | null) => void;
  setNickname: (nickname: string) => void;
  getPayload: () => OnboardingPayload;
};

const emptyIdentity: IdentityInfo = {
  name: '',
  birth: null,
  gender: null,
  phoneNumber: '',
  mobileCarrier: null,
};

const initialState: OnboardingState = {
  status: 'idle',
  email: '',
  identity: emptyIdentity,
  grade: null,
  selectSubject: null,
  schoolId: null,
  level: null,
  nickname: '',
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>((set, get) => ({
  ...initialState,
  start: () =>
    set(() => ({
      ...initialState,
      status: 'in-progress',
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
  setNickname: (nickname) => set({ nickname }),
  getPayload: () => {
    const { status: _status, ...payload } = get();
    return payload;
  },
}));
