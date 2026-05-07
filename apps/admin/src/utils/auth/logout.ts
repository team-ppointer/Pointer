import { adminSessionStorage } from './adminSessionStorage';
import { tokenStorage } from './tokenStorage';

export const logout = (): void => {
  tokenStorage.clearToken();
  adminSessionStorage.clearSession();
  window.location.href = '/login';
};

export const silentLogout = (): void => {
  tokenStorage.clearToken();
  adminSessionStorage.clearSession();
};
