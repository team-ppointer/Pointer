import { useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useGetHandwriting, useUpdateHandwriting } from '@/apis';
import { DrawingCanvasRef } from '../utils/skia/drawing';
import { encodeHandwritingData, decodeHandwritingData } from '../utils/handwritingEncoder';

export interface UseHandwritingManagerProps {
  scrapId: number;
  canvasRef: React.RefObject<DrawingCanvasRef | null>;
  hasUnsavedChanges: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: () => void;
}

export function useHandwritingManager({
  scrapId,
  canvasRef,
  hasUnsavedChanges,
  onSaveSuccess,
  onSaveError,
}: UseHandwritingManagerProps) {
  const { data: handwritingData, isLoading } = useGetHandwriting(scrapId, !!scrapId);
  const { mutate: updateHandwriting, isPending: isSaving } = useUpdateHandwriting();
  const lastSavedDataRef = useRef<string>('');

  // 필기 데이터 로드
  useEffect(() => {
    if (handwritingData?.data && canvasRef.current) {
      try {
        const decodedData = decodeHandwritingData(handwritingData.data);
        canvasRef.current.setStrokes(decodedData.strokes);
        canvasRef.current.setTexts(decodedData.texts);
        lastSavedDataRef.current = handwritingData.data;
      } catch (error) {
        console.error('필기 데이터 로드 실패:', error);
      }
    }
  }, [handwritingData, canvasRef]);

  // 저장하기 함수
  const handleSave = useCallback(
    (isAutoSave = false) => {
      if (!canvasRef.current) return Promise.resolve(false);

      const strokes = canvasRef.current.getStrokes();
      const texts = canvasRef.current.getTexts();

      try {
        const base64Data = encodeHandwritingData(strokes || [], texts || []);

        // 변경사항 없으면 저장 안 함
        if (base64Data === lastSavedDataRef.current) {
          if (!isAutoSave) {
            Alert.alert('알림', '변경사항이 없습니다.');
          }
          return Promise.resolve(true);
        }

        return new Promise<boolean>((resolve) => {
          updateHandwriting(
            {
              scrapId,
              request: { data: base64Data },
            },
            {
              onSuccess: () => {
                lastSavedDataRef.current = base64Data;
                onSaveSuccess?.();
                if (!isAutoSave) {
                  Alert.alert('성공', '필기가 저장되었습니다.');
                }
                resolve(true);
              },
              onError: (error) => {
                console.error('필기 저장 실패:', error);
                onSaveError?.();
                if (!isAutoSave) {
                  Alert.alert('오류', '필기 저장에 실패했습니다.');
                }
                resolve(false);
              },
            }
          );
        });
      } catch (error) {
        console.error('필기 데이터 변환 실패:', error);
        if (!isAutoSave) {
          Alert.alert('오류', '필기 데이터 변환에 실패했습니다.');
        }
        return Promise.resolve(false);
      }
    },
    [scrapId, canvasRef, updateHandwriting, onSaveSuccess, onSaveError]
  );

  // 10초마다 자동 저장
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && !isSaving) {
        handleSave(true);
      }
    }, 10000); // 10초마다 실행

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, isSaving, handleSave]);

  return {
    isLoading,
    isSaving,
    handleSave,
  };
}
