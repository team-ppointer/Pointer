import { create } from 'zustand';

import {
  clearAuthState,
  getAccessToken,
  getGrade,
  getName,
  getTeacherAccessToken,
  getTeacherName,
  setGrade,
  setName,
  setTeacherName,
} from '@utils/auth';

export type UserRole = 'student' | 'teacher' | null;
export type SessionStatus = 'unknown' | 'authenticated' | 'unauthenticated';

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

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,
  hydrateFromStorage: async () => {
    const hasStudentToken = Boolean(getAccessToken());
    const hasTeacherToken = Boolean(getTeacherAccessToken());

    if (hasTeacherToken) {
      set({
        role: 'teacher',
        sessionStatus: 'authenticated',
        teacherProfile: { name: getTeacherName() },
      });
      return;
    }

    if (hasStudentToken) {
      set({
        role: 'student',
        sessionStatus: 'authenticated',
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
