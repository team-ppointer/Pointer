import { useEffect, useCallback, useRef } from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';
import { useGetHandwriting, useUpdateHandwriting } from '@apis';

import { type DrawingCanvasRef } from '../utils/skia';
import { encodeHandwritingData, decodeHandwritingData } from '../utils/handwritingEncoder';

export interface UseHandwritingManagerProps {
  scrapId: number;
  canvasRef: React.RefObject<DrawingCanvasRef | null>;
  hasUnsavedChanges: boolean;
  strokeColor: string;
  onSaveSuccess?: () => void;
  onSaveError?: () => void;
  onColorRestore?: (color: string) => void;
}

export function useHandwritingManager({
  scrapId,
  canvasRef,
  hasUnsavedChanges,
  strokeColor,
  onSaveSuccess,
  onSaveError,
  onColorRestore,
}: UseHandwritingManagerProps) {
  const { data: handwritingData, isLoading } = useGetHandwriting(scrapId, !!scrapId);
  const { mutate: updateHandwriting, isPending: isSaving } = useUpdateHandwriting();
  const lastSavedDataRef = useRef<string>('');
  const currentScrapIdRef = useRef<number>(scrapId);

  // Stable refs for callback props (avoids exhaustive-deps issues)
  const onColorRestoreRef = useRef(onColorRestore);
  const isSavingRef = useRef(isSaving);
  onColorRestoreRef.current = onColorRestore;
  isSavingRef.current = isSaving;

  // scrapId가 변경되면 lastSavedDataRef 초기화
  useEffect(() => {
    if (currentScrapIdRef.current !== scrapId) {
      lastSavedDataRef.current = '';
      currentScrapIdRef.current = scrapId;
    }
  }, [scrapId]);

  // 필기 데이터 로드
  useEffect(() => {
    if (
      handwritingData?.data &&
      handwritingData.data !== lastSavedDataRef.current &&
      canvasRef.current &&
      currentScrapIdRef.current === scrapId &&
      !isSavingRef.current
    ) {
      const loadTimer = setTimeout(() => {
        if (currentScrapIdRef.current === scrapId && canvasRef.current && !isSavingRef.current) {
          try {
            const decodedData = decodeHandwritingData(handwritingData.data);
            canvasRef.current.setStrokes(decodedData.strokes);
            if (decodedData.texts?.length > 0) {
              canvasRef.current.setTextBoxes(decodedData.texts);
            }
            if (decodedData.lastColor) {
              onColorRestoreRef.current?.(decodedData.lastColor);
            }
            lastSavedDataRef.current = handwritingData.data;
          } catch (error) {
            console.error('필기 데이터 로드 실패:', error);
          }
        }
      }, 50);

      return () => clearTimeout(loadTimer);
    }
  }, [handwritingData, canvasRef, scrapId]);

  // 실제 저장 로직 (encode + API call)
  const doSave = useCallback(
    (
      strokes: ReturnType<DrawingCanvasRef['getStrokes']>,
      textBoxes: ReturnType<DrawingCanvasRef['getTextBoxes']>,
      isAutoSave: boolean,
      targetScrapId?: number
    ): Promise<boolean> => {
      try {
        const base64Data = encodeHandwritingData(strokes || [], textBoxes || [], strokeColor);

        if (base64Data === lastSavedDataRef.current) {
          if (!isAutoSave) {
            Alert.alert('알림', '변경사항이 없습니다.');
          }
          return Promise.resolve(true);
        }

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
    [scrapId, strokeColor, updateHandwriting, onSaveSuccess, onSaveError]
  );

  // 저장하기 함수
  const handleSave = useCallback(
    (isAutoSave = false, targetScrapId?: number) => {
      if (!canvasRef.current) return Promise.resolve(false);
      if (isSaving) return Promise.resolve(false);

      const strokes = canvasRef.current.getStrokes();
      const textBoxes = canvasRef.current.getTextBoxes();

      if (!isAutoSave) {
        return doSave(strokes, textBoxes, false, targetScrapId);
      }

      // 자동 저장: 다음 idle 시점에 실행
      return new Promise<boolean>((resolve) => {
        requestAnimationFrame(() => {
          doSave(strokes, textBoxes, true, targetScrapId).then(resolve);
        });
      });
    },
    [canvasRef, isSaving, doSave]
  );

  // 5초마다 자동 저장
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && !isSaving) {
        handleSave(true);
      }
    }, 5000);

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

  // 최신 상태를 ref로 유지 (unmount cleanup에서 stale closure 방지)
  const hasUnsavedRef = useRef(hasUnsavedChanges);
  const handleSaveRef = useRef(handleSave);
  hasUnsavedRef.current = hasUnsavedChanges;
  handleSaveRef.current = handleSave;

  // 화면 떠날 때 (unmount) 저장
  useEffect(() => {
    return () => {
      if (hasUnsavedRef.current) {
        handleSaveRef.current(true);
      }
    };
  }, []);

  return {
    isLoading,
    isSaving,
    handleSave,
  };
}
