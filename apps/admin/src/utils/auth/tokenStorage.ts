const createTokenStorage = () => {
  const ACCESS_TOKEN_KEY = 'pointer_admin_access_token';

  const getTokenFromStorage = (): string | null => {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
      return null;
    }
  };

  const setTokenToStorage = (token: string | null): void => {
    try {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch (error) {
      console.warn('Failed to set token to localStorage:', error);
    }
  };

  return {
    getToken: (): string | null => getTokenFromStorage(),
    setToken: (token: string | null): void => {
      setTokenToStorage(token);
    },
    clearToken: (): void => {
      setTokenToStorage(null);
    },
  };
};

export const tokenStorage = createTokenStorage();
