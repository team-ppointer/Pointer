import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY_PREFIX = 'pointer-native';
const buildKey = (key: keyof AuthMemory) => `${KEY_PREFIX}.${key}`;
const useSecureStore = Platform.OS !== 'web';

const setStorageItem = async (key: string, value: string | null) => {
  if (useSecureStore) {
    if (value) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
    return;
  }

  if (typeof window === 'undefined') return;

  if (value) {
    window.localStorage.setItem(key, value);
  } else {
    window.localStorage.removeItem(key);
  }
};

const getStorageItem = async (key: string) => {
  if (useSecureStore) {
    return SecureStore.getItemAsync(key);
  }
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

type AuthMemory = {
  accessToken: string | null;
  refreshToken: string | null;
  teacherAccessToken: string | null;
  teacherRefreshToken: string | null;
  name: string | null;
  grade: string | null;
  teacherName: string | null;
};

const memory: AuthMemory = {
  accessToken: null,
  refreshToken: null,
  teacherAccessToken: null,
  teacherRefreshToken: null,
  name: null,
  grade: null,
  teacherName: null,
};

const setItem = async (key: keyof AuthMemory, value: string | null) => {
  memory[key] = value;
  try {
    if (value) {
      await setStorageItem(buildKey(key), value);
    } else {
      await setStorageItem(buildKey(key), null);
    }
  } catch (error) {
    console.warn(`Unable to persist ${key} in secure storage`, error);
  }
};

const hydrateItem = async (key: keyof AuthMemory) => {
  try {
    memory[key] = await getStorageItem(buildKey(key));
  } catch (error) {
    console.warn(`Unable to read ${key} from secure storage`, error);
  }
};

export const hydrateAuthState = async () => {
  await Promise.all(Object.keys(memory).map((key) => hydrateItem(key as keyof AuthMemory)));
};

export const clearAuthState = async () => {
  await Promise.all(Object.keys(memory).map((key) => setItem(key as keyof AuthMemory, null)));
};

export const getAccessToken = () => memory.accessToken;
export const getRefreshToken = () => memory.refreshToken;
export const getTeacherAccessToken = () => memory.teacherAccessToken;
export const getTeacherRefreshToken = () => memory.teacherRefreshToken;
export const getName = () => memory.name;
export const getGrade = () => memory.grade;
export const getTeacherName = () => memory.teacherName;

export const setAccessToken = (token: string | null) => setItem('accessToken', token);
export const setRefreshToken = (token: string | null) => setItem('refreshToken', token);
export const setTeacherAccessToken = (token: string | null) => setItem('teacherAccessToken', token);
export const setTeacherRefreshToken = (token: string | null) =>
  setItem('teacherRefreshToken', token);
export const setName = (name: string | null) => setItem('name', name);
export const setGrade = (grade: string | null) => setItem('grade', grade);
export const setTeacherName = (name: string | null) => setItem('teacherName', name);
