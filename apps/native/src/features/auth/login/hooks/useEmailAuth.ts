import { useState, useCallback } from 'react';
import { client } from '@/apis/client';
import { postLoginLocal, postEmailSignup } from '@apis/student';
import { setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';

export type EmailAuthStep =
  | 'email'           // 이메일 입력
  | 'login'           // 로그인 (비밀번호 입력)
  | 'terms'           // 약관 동의 (회원가입)
  | 'signup'          // 회원가입 (비밀번호 입력)
  | 'forgot-email'    // 비밀번호 찾기 - 이메일 확인
  | 'forgot-code'     // 비밀번호 찾기 - 코드 입력
  | 'forgot-reset';   // 비밀번호 찾기 - 새 비밀번호

export type EmailAuthState = {
  step: EmailAuthStep;
  email: string;
  isLoading: boolean;
  error: string | null;
  emailExists: boolean | null;
};

type TermsAgreement = {
  isGteFourteen: boolean;
  isAgreeServiceUsage: boolean;
  isAgreePersonalInformation: boolean;
  isAgreeReceiveMarketing: boolean;
};

type UseEmailAuthReturn = EmailAuthState & {
  setEmail: (email: string) => void;
  checkEmail: () => Promise<void>;
  login: (password: string) => Promise<void>;
  signup: (password: string, terms: TermsAgreement) => Promise<void>;
  goToForgotPassword: () => void;
  goBack: () => void;
  reset: () => void;
  setStep: (step: EmailAuthStep) => void;
  proceedToSignup: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return '이메일을 입력해주세요.';
  }
  if (!EMAIL_REGEX.test(email)) {
    return '올바른 이메일 형식이 아닙니다.';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return '비밀번호를 입력해주세요.';
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
  }
  return null;
};

const initialState: EmailAuthState = {
  step: 'email',
  email: '',
  isLoading: false,
  error: null,
  emailExists: null,
};

const useEmailAuth = (): UseEmailAuthReturn => {
  const [state, setState] = useState<EmailAuthState>(initialState);

  const { setSessionStatus, setRole, updateStudentProfile } = useAuthStore();
  const startOnboarding = useOnboardingStore((s) => s.start);
  const completeOnboarding = useOnboardingStore((s) => s.complete);

  const setEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, email, error: null }));
  }, []);

  const setStep = useCallback((step: EmailAuthStep) => {
    setState((prev) => ({ ...prev, step, error: null }));
  }, []);

  const checkEmail = useCallback(async () => {
    const emailError = validateEmail(state.email);
    if (emailError) {
      setState((prev) => ({ ...prev, error: emailError }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await client.GET('/api/student/auth/email/exists', {
        params: {
          query: { email: state.email },
        },
      });

      if (error || data === undefined) {
        throw new Error('이메일 확인에 실패했습니다.');
      }

      const exists = data.value === true;

      setState((prev) => ({
        ...prev,
        isLoading: false,
        emailExists: exists,
        step: exists ? 'login' : 'terms',
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error?.message ?? '이메일 확인 중 오류가 발생했습니다.',
      }));
    }
  }, [state.email]);

  const handleAuthSuccess = useCallback(
    async (response: {
      accessToken?: string;
      refreshToken?: string;
      isFirstLogin?: boolean;
      name?: string;
      grade?: string;
      email?: string;
    }) => {
      const { accessToken, refreshToken, isFirstLogin, name, grade, email } = response;

      if (!accessToken) {
        throw new Error('Access token not found');
      }

      await setAccessToken(accessToken);
      if (refreshToken) {
        await setRefreshToken(refreshToken);
      }

      if (name || grade) {
        await updateStudentProfile({
          name: name ?? null,
          grade: grade ?? null,
        });
      }

      if (isFirstLogin) {
        // 이메일 로그인인 경우 이메일을 전달하여 이메일 스텝 스킵
        startOnboarding(email);
      } else {
        completeOnboarding();
      }

      setRole('student');
      setSessionStatus('authenticated');
    },
    [setRole, setSessionStatus, updateStudentProfile, startOnboarding, completeOnboarding]
  );

  const login = useCallback(
    async (password: string) => {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setState((prev) => ({ ...prev, error: passwordError }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const { data, error } = await postLoginLocal({
          email: state.email,
          password,
        });

        if (error || !data) {
          throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        }

        await handleAuthSuccess({
          accessToken: data.token.accessToken,
          refreshToken: data.token.refreshToken,
          isFirstLogin: data.isFirstLogin,
          name: data.name,
          grade: data.grade,
          email: state.email,
        });

        setState(initialState);
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error?.message ?? '로그인에 실패했습니다.',
        }));
      }
    },
    [state.email, handleAuthSuccess]
  );

  const signup = useCallback(
    async (password: string, terms: TermsAgreement) => {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setState((prev) => ({ ...prev, error: passwordError }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await postEmailSignup({
          email: state.email,
          password,
        });

        if (!response.isSuccess || !response.data) {
          throw new Error('회원가입에 실패했습니다.');
        }

        await handleAuthSuccess({
          accessToken: response.data.token.accessToken,
          refreshToken: response.data.token.refreshToken,
          isFirstLogin: true, // 회원가입은 항상 신규 회원
          name: response.data.name,
          grade: response.data.grade,
          email: state.email,
        });

        setState(initialState);
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error?.message ?? '회원가입에 실패했습니다.',
        }));
      }
    },
    [state.email, handleAuthSuccess]
  );

  const goToForgotPassword = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'forgot-email', error: null }));
  }, []);

  const proceedToSignup = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'signup', error: null }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      switch (prev.step) {
        case 'login':
        case 'terms':
          return { ...prev, step: 'email', error: null };
        case 'signup':
          return { ...prev, step: 'terms', error: null };
        case 'forgot-email':
          return { ...prev, step: 'login', error: null };
        case 'forgot-code':
          return { ...prev, step: 'forgot-email', error: null };
        case 'forgot-reset':
          return { ...prev, step: 'forgot-code', error: null };
        default:
          return prev;
      }
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    setEmail,
    checkEmail,
    login,
    signup,
    goToForgotPassword,
    goBack,
    reset,
    setStep,
    proceedToSignup,
  };
};

export default useEmailAuth;
