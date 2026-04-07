import { useEffect, useCallback, useRef } from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';

import { useGetHandwriting, useUpdateHandwriting } from '@/apis';

import { type DrawingCanvasRef } from '../utils/skia/drawing';
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
  const currentScrapIdRef = useRef<number>(scrapId);

  // scrapId가 변경되면 lastSavedDataRef 초기화
  useEffect(() => {
    if (currentScrapIdRef.current !== scrapId) {
      lastSavedDataRef.current = '';
      currentScrapIdRef.current = scrapId;
    }
  }, [scrapId]);

  // 필기 데이터 로드
  useEffect(() => {
    // 저장 중이 아니고, scrapId가 일치할 때만 로드 (데이터 유실 방지)
    if (
      handwritingData?.data &&
      canvasRef.current &&
      currentScrapIdRef.current === scrapId &&
      !isSaving
    ) {
      // clear() 완료를 보장하기 위해 약간의 지연 후 로드
      const loadTimer = setTimeout(() => {
        // 다시 한번 scrapId 확인 (clear() 실행 중일 수 있음)
        if (currentScrapIdRef.current === scrapId && canvasRef.current && !isSaving) {
          try {
            const decodedData = decodeHandwritingData(handwritingData.data);
            canvasRef.current.setStrokes(decodedData.strokes);
            canvasRef.current.setTexts(decodedData.texts);
            lastSavedDataRef.current = handwritingData.data;
          } catch (error) {
            console.error('필기 데이터 로드 실패:', error);
          }
        }
      }, 50); // 50ms 지연으로 clear() 완료 보장

      return () => clearTimeout(loadTimer);
    }
  }, [handwritingData, canvasRef, scrapId]);

  // 저장하기 함수
  const handleSave = useCallback(
    (isAutoSave = false, targetScrapId?: number) => {
      if (!canvasRef.current) return Promise.resolve(false);

      // 이미 저장 중이면 중복 저장 방지
      if (isSaving) {
        return Promise.resolve(false);
      }

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

        // targetScrapId가 제공되면 그것을 사용, 아니면 scrapId 사용
        const saveScrapId = targetScrapId ?? scrapId;

        return new Promise<boolean>((resolve) => {
          updateHandwriting(
            {
              scrapId: saveScrapId,
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
    [scrapId, canvasRef, updateHandwriting, onSaveSuccess, onSaveError, isSaving]
  );

  // 5초마다 자동 저장
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && !isSaving) {
        handleSave(true);
      }
    }, 5000); // 5초마다 실행

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, isSaving, handleSave]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' && hasUnsavedChanges && !isSaving) {
        handleSave(true);
      }
    });
    return () => subscription.remove();
  }, [hasUnsavedChanges, isSaving, handleSave]);

  return {
    isLoading,
    isSaving,
    handleSave,
  };
}
