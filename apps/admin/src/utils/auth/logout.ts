import { tokenStorage } from './tokenStorage';

export const logout = (): void => {
  tokenStorage.clearToken();
  window.location.href = '/login';
};

export const silentLogout = (): void => {
  tokenStorage.clearToken();
};
