import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// 에러 핸들러 타입 정의
type ErrorHandler = (error: Error) => void;

// 기본 에러 핸들러 (Alert 사용)
const defaultErrorHandler: ErrorHandler = (error: Error) => {
  if (error.message?.includes('permission')) {
    const permissionType = error.message.includes('Camera') ? '카메라' : '갤러리';
    Alert.alert('권한 필요', `${permissionType} 권한이 필요합니다.`);
  } else {
    console.error('이미지 선택 오류:', error);
  }
};

// 카메라 열기 (에러 처리 포함)
export const openCameraWithErrorHandling = async (
  onError?: ErrorHandler
): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    return await openCamera();
  } catch (error: any) {
    const handler = onError || defaultErrorHandler;
    handler(error);
    return null;
  }
};

// 갤러리 열기 (에러 처리 포함)
export const openImageLibraryWithErrorHandling = async (
  onError?: ErrorHandler
): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    return await openImageLibrary();
  } catch (error: any) {
    const handler = onError || defaultErrorHandler;
    handler(error);
    return null;
  }
};

// 기존 함수들 (하위 호환성 유지)
export const openCamera = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission denied');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 1,
  });

  if (result.canceled) return null;
  return result.assets[0];
};

export const openImageLibrary = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Gallery permission denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
  });

  if (result.canceled) return null;
  return result.assets[0];
};
