import { create } from 'zustand';

import {
  clearAuthState,
  getAccessToken,
  getGrade,
  getName,
  getRefreshToken,
  getTeacherAccessToken,
  getTeacherName,
  setAccessToken,
  setGrade,
  setName,
  setRefreshToken,
  setTeacherName,
} from '@utils/auth';
import { bareClient } from '@apis/bareClient';

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

  try {
    const { data, error } = await bareClient.POST('/api/student/auth/refresh', {
      body: { refreshToken },
    });

    if (error || !data) return { valid: false };

    if (data.token.accessToken) {
      await setAccessToken(data.token.accessToken);
    }
    if (data.token.refreshToken) {
      await setRefreshToken(data.token.refreshToken);
    }

    return { valid: true, name: data.name, grade: data.grade };
  } catch {
    return { valid: false };
  }
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

    if (state.role === 'student') {
      const result = await verifyStudentSession();

      if (result.valid) {
        if (result.name !== undefined || result.grade !== undefined) {
          if (result.name) await setName(result.name);
          if (result.grade) await setGrade(result.grade);
        }
        set({
          sessionStatus: 'authenticated',
          studentProfile: {
            name: result.name ?? getName(),
            grade: result.grade ?? getGrade(),
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
