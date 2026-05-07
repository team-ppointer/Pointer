import { AdminSession } from '@/constants/adminPermissions';

const ADMIN_SESSION_KEY = 'pointer_admin_session';

const parseAdminSession = (value: string | null): AdminSession | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as AdminSession;
  } catch (error) {
    console.warn('Failed to parse admin session from localStorage:', error);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
};

const createAdminSessionStorage = () => {
  return {
    getSession: (): AdminSession | null => {
      try {
        return parseAdminSession(localStorage.getItem(ADMIN_SESSION_KEY));
      } catch (error) {
        console.warn('Failed to get admin session from localStorage:', error);
        return null;
      }
    },
    setSession: (session: AdminSession | null): void => {
      try {
        if (session) {
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      } catch (error) {
        console.warn('Failed to set admin session to localStorage:', error);
      }
    },
    clearSession: (): void => {
      try {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      } catch (error) {
        console.warn('Failed to clear admin session from localStorage:', error);
      }
    },
  };
};

export const adminSessionStorage = createAdminSessionStorage();
