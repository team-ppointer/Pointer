import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'pointer-native';
const KEYCHAIN_SERVICE = 'pointer-native-auth';
const INSTALL_MARKER_KEY = `${KEY_PREFIX}.installMarker`;

const buildKey = (key: keyof AuthMemory) => `${KEY_PREFIX}.${key}`;
const useSecureStore = Platform.OS !== 'web';

// Isolates keychain items and prevents iCloud sync/backup restoration
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainService: KEYCHAIN_SERVICE,
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

const setStorageItem = async (key: string, value: string | null) => {
  if (useSecureStore) {
    if (value) {
      await SecureStore.setItemAsync(key, value, secureStoreOptions);
    } else {
      await SecureStore.deleteItemAsync(key, secureStoreOptions);
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
    return SecureStore.getItemAsync(key, secureStoreOptions);
  }
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

// Migrates existing keychain items stored without keychainService to the new namespaced keychain
const migrateItem = async (key: string): Promise<string | null> => {
  if (!useSecureStore) return null;

  try {
    const oldValue = await SecureStore.getItemAsync(key);
    if (oldValue) {
      await SecureStore.setItemAsync(key, oldValue, secureStoreOptions);
      await SecureStore.deleteItemAsync(key);
      return oldValue;
    }
  } catch {
    // noop
  }

  return null;
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
  const storageKey = buildKey(key);
  try {
    let value = await getStorageItem(storageKey);

    if (value === null && useSecureStore) {
      value = await migrateItem(storageKey);
    }

    memory[key] = value;
  } catch (error) {
    console.warn(`Unable to read ${key} from secure storage`, error);
  }
};

/**
 * Detects app reinstall using AsyncStorage (cleared on uninstall) as a marker.
 * iOS Keychain persists across app reinstalls, so stale tokens must be cleared manually.
 */
export const handleReinstallDetection = async () => {
  if (!useSecureStore) return;

  try {
    const marker = await AsyncStorage.getItem(INSTALL_MARKER_KEY);

    if (marker === null) {
      const allKeys = Object.keys(memory) as (keyof AuthMemory)[];
      await Promise.all(
        allKeys.map(async (key) => {
          const storageKey = buildKey(key);
          try {
            await SecureStore.deleteItemAsync(storageKey, secureStoreOptions);
            await SecureStore.deleteItemAsync(storageKey);
          } catch {
            // noop
          }
        })
      );

      await AsyncStorage.setItem(INSTALL_MARKER_KEY, Date.now().toString());
    }
  } catch (error) {
    console.warn('Reinstall detection failed', error);
  }
};

export const hydrateAuthState = async () => {
  await handleReinstallDetection();
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
