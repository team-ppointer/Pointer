import { create } from 'zustand';

import {
  clearAuthState,
  getAccessToken,
  getGrade,
  getName,
  getRefreshToken,
  getTeacherAccessToken,
  getTeacherName,
  setGrade,
  setName,
  setTeacherName,
} from '@utils/auth';
import { bareClient } from '@apis/bareClient';
import refreshAndPersistTokens from '@apis/refreshAndPersistTokens';
import { useSignupStore } from '@features/auth/signup/store/useSignupStore';
import { useOnboardingStore } from '@features/student/onboarding/store/useOnboardingStore';

export type UserRole = 'student' | 'teacher' | null;
export type SessionStatus =
  | 'unknown'
  | 'hydrating'
  | 'checking'
  | 'authenticated'
  | 'unauthenticated';

type StudentProfile = {
  name?: string | null;
  grade?: string | null;
};

type TeacherProfile = {
  name?: string | null;
};

type AuthState = {
  role: UserRole;
  sessionStatus: SessionStatus;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
};

type AuthActions = {
  hydrateFromStorage: () => Promise<void>;
  verifySession: () => Promise<void>;
  setRole: (role: UserRole) => void;
  setSessionStatus: (status: SessionStatus) => void;
  updateStudentProfile: (profile: StudentProfile) => Promise<void>;
  updateTeacherProfile: (profile: TeacherProfile) => Promise<void>;
  signOut: () => Promise<void>;
};

const initialState: AuthState = {
  role: null,
  sessionStatus: 'unknown',
  studentProfile: undefined,
  teacherProfile: undefined,
};

let verifySessionPromise: Promise<void> | null = null;

type AuthSetter = (
  partial:
    | (AuthState & AuthActions)
    | Partial<AuthState & AuthActions>
    | ((
        state: AuthState & AuthActions
      ) => (AuthState & AuthActions) | Partial<AuthState & AuthActions>)
) => void;

const applyStudentVerified = async (
  set: AuthSetter,
  result: { name?: string; grade?: string }
): Promise<void> => {
  if (result.name !== undefined) await setName(result.name ?? null);
  if (result.grade !== undefined) await setGrade(result.grade ?? null);
  set({
    sessionStatus: 'authenticated',
    studentProfile: {
      name: result.name !== undefined ? result.name : getName(),
      grade: result.grade !== undefined ? result.grade : getGrade(),
    },
  });
};

const runStudentVerification = async (set: AuthSetter): Promise<void> => {
  const result = await verifyStudentSession();
  if (result.valid) {
    await applyStudentVerified(set, result);
    return;
  }
  if (result.transient) {
    // 5xx/네트워크 장애로 검증을 끝낼 수 없으면 캐시된 프로필로 낙관적 인증 유지.
    // 다음 API 호출에서 갱신/실패가 자연스럽게 처리된다.
    set({
      sessionStatus: 'authenticated',
      studentProfile: { name: getName(), grade: getGrade() },
    });
    return;
  }
  await clearAuthState();
  set({ ...initialState, sessionStatus: 'unauthenticated' });
};

const runVerifySession = async (set: AuthSetter): Promise<void> => {
  const state = useAuthStore.getState();
  if (state.sessionStatus !== 'checking') return;

  if (state.role === 'student') {
    await runStudentVerification(set);
    return;
  }

  // TODO: implement teacher token verification when teacher refresh API is ready
  if (state.role === 'teacher') {
    set({ sessionStatus: 'authenticated' });
    return;
  }

  set({ ...initialState, sessionStatus: 'unauthenticated' });
};

type VerifyStudentSessionResult =
  | { valid: true; name?: string; grade?: string }
  | { valid: false; transient: boolean };

const fetchStudentMe = async (
  accessToken: string
): Promise<
  { ok: true; name?: string; grade?: string } | { ok: false; status: 'auth' | 'transient' }
> => {
  try {
    const result = await bareClient.GET('/api/student/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (result.data) {
      return { ok: true, name: result.data.name, grade: result.data.grade };
    }
    const status = result.response?.status;
    if (status !== undefined && status >= 500) {
      return { ok: false, status: 'transient' };
    }
    return { ok: false, status: 'auth' };
  } catch {
    return { ok: false, status: 'transient' };
  }
};

const verifyStudentSession = async (): Promise<VerifyStudentSessionResult> => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken) {
    const me = await fetchStudentMe(accessToken);
    if (me.ok) return { valid: true, name: me.name, grade: me.grade };
    if (me.status === 'transient') return { valid: false, transient: true };
    // auth failure → fall through to refresh
  }

  if (!refreshToken) return { valid: false, transient: false };

  const result = await refreshAndPersistTokens();
  if (!result.success) return { valid: false, transient: result.transient };

  const me = await fetchStudentMe(result.data.token.accessToken);
  if (me.ok) return { valid: true, name: me.name, grade: me.grade };
  if (me.status === 'transient') {
    return { valid: false, transient: true };
  }
  // /me 가 refresh 직후에도 401/4xx 라면 응답 페이로드에 담긴 name/grade 를 fallback 으로 사용한다.
  return { valid: true, name: result.data.name, grade: result.data.grade };
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,

  hydrateFromStorage: async () => {
    set({ sessionStatus: 'hydrating' });

    const hasStudentToken = Boolean(getAccessToken()) || Boolean(getRefreshToken());
    const hasTeacherToken = Boolean(getTeacherAccessToken());

    if (hasTeacherToken) {
      set({
        role: 'teacher',
        sessionStatus: 'checking',
        teacherProfile: { name: getTeacherName() },
      });
      return;
    }

    if (hasStudentToken) {
      set({
        role: 'student',
        sessionStatus: 'checking',
        studentProfile: { name: getName(), grade: getGrade() },
      });
      return;
    }

    set({
      role: null,
      sessionStatus: 'unauthenticated',
      studentProfile: undefined,
      teacherProfile: undefined,
    });
  },

  verifySession: async () => {
    // JS single-thread 보장: check 와 IIFE 의 동기 할당 사이에 다른 caller 가
    // 끼어들 수 없으므로 dedupe 가 성립한다. 향후 이 사이에 await 를 추가하지 말 것.
    if (verifySessionPromise) return verifySessionPromise;

    verifySessionPromise = (async () => {
      try {
        await runVerifySession(set);
      } catch (error) {
        console.warn('Session verification failed unexpectedly', error);
        await clearAuthState().catch(() => {});
        set({ ...initialState, sessionStatus: 'unauthenticated' });
      } finally {
        verifySessionPromise = null;
      }
    })();

    return verifySessionPromise;
  },

  setRole: (role) => set({ role }),
  setSessionStatus: (sessionStatus) => set({ sessionStatus }),

  updateStudentProfile: async (profile) => {
    await Promise.all([
      profile.name !== undefined ? setName(profile.name) : Promise.resolve(),
      profile.grade !== undefined ? setGrade(profile.grade) : Promise.resolve(),
    ]);
    set((state) => ({
      studentProfile: {
        ...state.studentProfile,
        ...profile,
      },
    }));
  },

  updateTeacherProfile: async (profile) => {
    if (profile.name !== undefined) {
      await setTeacherName(profile.name);
    }
    set((state) => ({
      teacherProfile: {
        ...state.teacherProfile,
        ...profile,
      },
    }));
  },

  signOut: async () => {
    await clearAuthState();
    useSignupStore.getState().reset();
    useOnboardingStore.getState().reset();
    set({ ...initialState, sessionStatus: 'unauthenticated' });
  },
}));
