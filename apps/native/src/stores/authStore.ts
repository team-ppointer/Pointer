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

const verifyStudentSession = async (): Promise<{
  valid: boolean;
  name?: string;
  grade?: string;
}> => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken) {
    try {
      const { data } = await bareClient.GET('/api/student/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (data) {
        return { valid: true, name: data.name, grade: data.grade };
      }
    } catch {
      // noop
    }
  }

  if (!refreshToken) return { valid: false };

  const result = await refreshAndPersistTokens();
  if (!result.success) return { valid: false };

  try {
    const { data } = await bareClient.GET('/api/student/me', {
      headers: { Authorization: `Bearer ${result.data.token.accessToken}` },
    });
    if (data) {
      return { valid: true, name: data.name, grade: data.grade };
    }
  } catch {
    // /me failed after successful refresh — use refresh response as fallback
  }

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
    const state = useAuthStore.getState();

    if (state.sessionStatus !== 'checking') return;

    try {
      if (state.role === 'student') {
        const result = await verifyStudentSession();

        if (result.valid) {
          if (result.name !== undefined) await setName(result.name ?? null);
          if (result.grade !== undefined) await setGrade(result.grade ?? null);
          set({
            sessionStatus: 'authenticated',
            studentProfile: {
              name: result.name !== undefined ? result.name : getName(),
              grade: result.grade !== undefined ? result.grade : getGrade(),
            },
          });
        } else {
          await clearAuthState();
          set({ ...initialState, sessionStatus: 'unauthenticated' });
        }
        return;
      }

      // TODO: implement teacher token verification when teacher refresh API is ready
      if (state.role === 'teacher') {
        set({ sessionStatus: 'authenticated' });
        return;
      }

      set({ ...initialState, sessionStatus: 'unauthenticated' });
    } catch (error) {
      console.warn('Session verification failed unexpectedly', error);
      await clearAuthState().catch(() => {});
      set({ ...initialState, sessionStatus: 'unauthenticated' });
    }
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
    set({ ...initialState, sessionStatus: 'unauthenticated' });
  },
}));
