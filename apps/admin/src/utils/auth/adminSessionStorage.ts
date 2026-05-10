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
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cachedSnapshot: AdminSession | null = null;
  let isCached = false;

  const computeSnapshot = (): AdminSession | null => {
    let raw: string | null;
    try {
      raw = localStorage.getItem(ADMIN_SESSION_KEY);
    } catch (error) {
      console.warn('Failed to get admin session from localStorage:', error);
      return null;
    }

    // useSyncExternalStore가 동일 데이터에 동일 참조를 받도록 캐시한다.
    if (isCached && raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;
    cachedSnapshot = parseAdminSession(raw);
    isCached = true;
    return cachedSnapshot;
  };

  const notify = () => listeners.forEach((listener) => listener());

  // 다른 탭에서 세션이 바뀌면 (로그아웃 / 다른 계정 로그인) 캐시 무효화 후 알림.
  // event.key === null 은 localStorage.clear() 를 의미하므로 같이 처리한다.
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.storageArea !== localStorage) return;
      if (event.key !== null && event.key !== ADMIN_SESSION_KEY) return;
      isCached = false;
      notify();
    });
  }

  return {
    getSession: computeSnapshot,
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
      notify();
    },
    clearSession: (): void => {
      try {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      } catch (error) {
        console.warn('Failed to clear admin session from localStorage:', error);
      }
      notify();
    },
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const adminSessionStorage = createAdminSessionStorage();
