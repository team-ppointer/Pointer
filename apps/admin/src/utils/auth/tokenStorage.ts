const createTokenStorage = () => {
  let accessToken: string | null = null;

  return {
    getToken: (): string | null => accessToken,
    setToken: (token: string | null): void => {
      accessToken = token;
    },
    clearToken: (): void => {
      accessToken = null;
    },
  };
};

export const tokenStorage = createTokenStorage();
