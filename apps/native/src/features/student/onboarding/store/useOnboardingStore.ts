import { create } from 'zustand';
import type {
  CarrierOption,
  GradeValue,
  MathSubjectValue,
  ScoreValue,
} from '../constants';

type IdentityInfo = {
  name: string;
  registrationFront: string;
  registrationBack: string;
  phone: string;
  carrier: CarrierOption | null;
};

type OnboardingStatus = 'idle' | 'in-progress' | 'completed';

type OnboardingState = {
  status: OnboardingStatus;
  email: string;
  identity: IdentityInfo;
  grade: GradeValue | null;
  mathSubject: MathSubjectValue | null;
  school: string | null;
  score: ScoreValue | null;
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
  setMathSubject: (subject: MathSubjectValue) => void;
  setSchool: (school: string | null) => void;
  setScore: (score: ScoreValue | null) => void;
  setNickname: (nickname: string) => void;
  getPayload: () => OnboardingPayload;
};

const emptyIdentity: IdentityInfo = {
  name: '',
  registrationFront: '',
  registrationBack: '',
  phone: '',
  carrier: null,
};

const initialState: OnboardingState = {
  status: 'idle',
  email: '',
  identity: emptyIdentity,
  grade: null,
  mathSubject: null,
  school: null,
  score: null,
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
  setMathSubject: (mathSubject) => set({ mathSubject }),
  setSchool: (school) => set({ school }),
  setScore: (score) => set({ score }),
  setNickname: (nickname) => set({ nickname }),
  getPayload: () => {
    const { status: _status, ...payload } = get();
    return payload;
  },
}));

