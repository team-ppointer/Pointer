import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type TermsAgreement = {
  isGteFourteen: boolean;
  isAgreeServiceUsage: boolean;
  isAgreePersonalInformation: boolean;
  isAgreeReceiveMarketing: boolean;
};

type Step1Data = {
  email: string;
  name: string;
  phoneNumber: string;
  terms: TermsAgreement;
};

type SignupState = {
  /** Whether STEP 1 (terms + identity verification) is completed */
  step1Completed: boolean;
  /** STEP 1 collected data */
  step1Data: Step1Data;
  /** OAuth provider used for social signup (null for email signup) */
  provider: 'KAKAO' | 'GOOGLE' | 'APPLE' | null;
};

type SignupActions = {
  setEmail: (email: string) => void;
  setIdentity: (name: string, phoneNumber: string) => void;
  setTerms: (terms: TermsAgreement) => void;
  setProvider: (provider: SignupState['provider']) => void;
  completeStep1: () => void;
  reset: () => void;
};

const emptyTerms: TermsAgreement = {
  isGteFourteen: false,
  isAgreeServiceUsage: false,
  isAgreePersonalInformation: false,
  isAgreeReceiveMarketing: false,
};

const initialStep1Data: Step1Data = {
  email: '',
  name: '',
  phoneNumber: '',
  terms: emptyTerms,
};

const initialState: SignupState = {
  step1Completed: false,
  step1Data: initialStep1Data,
  provider: null,
};

export const useSignupStore = create<SignupState & SignupActions>()(
  persist(
    (set) => ({
      ...initialState,

      setEmail: (email) =>
        set((state) => ({
          step1Data: { ...state.step1Data, email },
        })),

      setIdentity: (name, phoneNumber) =>
        set((state) => ({
          step1Data: { ...state.step1Data, name, phoneNumber },
        })),

      setTerms: (terms) =>
        set((state) => ({
          step1Data: { ...state.step1Data, terms },
        })),

      setProvider: (provider) => set({ provider }),

      completeStep1: () => set({ step1Completed: true }),

      reset: () => set(initialState),
    }),
    {
      name: 'signup-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
