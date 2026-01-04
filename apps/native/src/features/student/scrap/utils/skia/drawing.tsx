import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Dimensions,
  Pressable,
  Text as RNText,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import {
  Canvas,
  Path,
  SkPath,
  Skia,
  Text,
  useFont,
  Circle,
  Group,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector, PointerType } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { buildSmoothPath } from '../../utils/skia/smoothing';

export type Point = { x: number; y: number };
export type Stroke = { points: Point[]; color: string; width: number };
export type TextItem = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
};
export type DrawingCanvasRef = {
  clear: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getStrokes: () => Stroke[];
  setStrokes: (strokes: Stroke[]) => void;
  getTexts: () => TextItem[];
  setTexts: (texts: TextItem[]) => void;
};

type Props = {
  strokeColor?: string;
  strokeWidth?: number;
  onChange?: (strokes: Stroke[]) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  eraserMode?: boolean;
  eraserSize?: number;
  textMode?: boolean;
  textFontSize?: number;
};

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>(
  (
    {
      strokeColor = 'black',
      strokeWidth = 3,
      onChange,
      onHistoryChange,
      eraserMode = false,
      eraserSize = 20,
      textMode = false,
      textFontSize = 32,
    },
    ref
  ) => {
    const [paths, setPaths] = useState<SkPath[]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [texts, setTexts] = useState<TextItem[]>([]);
    const [, setTick] = useState(0);
    const [activeTextInput, setActiveTextInput] = useState<{
      id: string;
      x: number;
      y: number;
      value: string;
    } | null>(null);
    const textInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const containerLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(
      null
    );
    const canvasHeight = useRef<number>(800); // 기본 캔버스 높이
    const maxY = useRef<number>(0); // 그려진 내용의 최대 Y 좌표
    const keyboardHeight = useRef<number>(0); // 키보드 높이

    // 호버 좌표를 저장할 SharedValue (성능을 위해 스레드 분리)
    const hoverX = useSharedValue(0);
    const hoverY = useSharedValue(0);
    const showHover = useSharedValue(false);

    const livePath = useRef<SkPath>(Skia.Path.Make());
    const currentPoints = useRef<Point[]>([]);
    const strokesRef = useRef<Stroke[]>([]);
    const textsRef = useRef<TextItem[]>([]);
    const eraserPoints = useRef<Point[]>([]);
    const lastEraserTime = useRef<number>(0);
    const ERASER_THROTTLE_MS = 16; // ~60fps

    // 히스토리 관리 (모든 동작에 대한 undo 지원)
    type HistoryState = { strokes: Stroke[]; texts: TextItem[] };
    const historyRef = useRef<HistoryState[]>([]);
    const historyIndexRef = useRef<number>(-1);

    // 히스토리 상태 변경 알림
    const notifyHistoryChange = useCallback(() => {
      if (!onHistoryChange) return;

      const canUndo =
        activeTextInput !== null ||
        historyIndexRef.current > 0 ||
        (historyIndexRef.current === 0 && historyRef.current.length > 1);

      const canRedo =
        activeTextInput === null && historyIndexRef.current + 1 < historyRef.current.length;

      onHistoryChange(canUndo, canRedo);
    }, [onHistoryChange, activeTextInput]);

    // 현재 상태를 히스토리에 저장
    const saveToHistory = useCallback(() => {
      const currentState: HistoryState = {
        strokes: JSON.parse(JSON.stringify(strokesRef.current)), // deep copy
        texts: JSON.parse(JSON.stringify(textsRef.current)), // deep copy
      };

      // 현재 인덱스 이후의 히스토리 제거 (새 동작이 발생하면 redo 불가)
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);

      // 새 상태 추가
      historyRef.current.push(currentState);
      historyIndexRef.current = historyRef.current.length - 1;

      // 히스토리 크기 제한 (메모리 관리)
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
        historyIndexRef.current--;
      }

      notifyHistoryChange();
    }, [notifyHistoryChange]);

    // 히스토리에서 상태 복원
    const restoreFromHistory = useCallback(
      (index: number) => {
        if (index < 0 || index >= historyRef.current.length) return;

        const state = historyRef.current[index];
        const newPaths = state.strokes.map((stroke) => buildSmoothPath(stroke.points));

        setStrokes(state.strokes);
        setPaths(newPaths);
        setTexts(state.texts);
        strokesRef.current = state.strokes;
        textsRef.current = state.texts;

        // 최대 Y 좌표 재계산
        let maxYValue = 0;
        if (state.strokes.length > 0) {
          const strokesMaxY = Math.max(
            ...state.strokes.flatMap((stroke) => stroke.points.map((p) => p.y))
          );
          maxYValue = Math.max(maxYValue, strokesMaxY);
        }
        if (state.texts.length > 0) {
          const textsMaxY = Math.max(...state.texts.map((text) => text.y));
          maxYValue = Math.max(maxYValue, textsMaxY);
        }

        if (maxYValue > 0) {
          maxY.current = maxYValue;
          canvasHeight.current = Math.max(800, maxY.current + 200);
        } else {
          maxY.current = 0;
          canvasHeight.current = 800;
        }

        onChange?.(state.strokes);
        setTick((t) => t + 1);
        notifyHistoryChange();
      },
      [onChange, notifyHistoryChange]
    );

    // 폰트 로드
    const font = useFont(require('@assets/fonts/PretendardVariable.ttf'), textFontSize);

    // 텍스트의 실제 줄 수 계산 (자동 줄바꿈 포함)
    const calculateTextLineCount = useCallback(
      (text: string): number => {
        if (!font) return 1;

        const maxWidth = Dimensions.get('window').width * 0.5 - 40;
        let totalLines = 0;

        const paragraphs = text.split('\n');

        paragraphs.forEach((paragraph) => {
          if (!paragraph) {
            totalLines += 1;
            return;
          }

          const words = paragraph.split(' ');
          let currentLine = '';
          let paragraphLines = 0;

          words.forEach((word, idx) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = font.measureText(testLine).width;

            if (textWidth > maxWidth && currentLine) {
              paragraphLines += 1;
              currentLine = word;
            } else {
              currentLine = testLine;
            }

            if (idx === words.length - 1) {
              paragraphLines += 1;
            }
          });

          totalLines += paragraphLines;
        });

        return totalLines;
      },
      [font]
    );

    const loadStrokes = useCallback(
      (newStrokes: Stroke[]) => {
        // strokes와 paths를 함께 업데이트
        const newPaths = newStrokes.map((stroke) => buildSmoothPath(stroke.points));
        setStrokes(newStrokes);
        setPaths(newPaths);
        strokesRef.current = newStrokes;

        // 최대 Y 좌표 계산
        if (newStrokes.length > 0) {
          const maxYValue = Math.max(
            ...newStrokes.flatMap((stroke) => stroke.points.map((p) => p.y))
          );
          maxY.current = maxYValue;
          canvasHeight.current = Math.max(800, maxYValue + 200);
        } else {
          maxY.current = 0;
          canvasHeight.current = 800;
        }

        setTick((t) => t + 1);
        onChange?.(newStrokes);

        // 히스토리 초기화 및 초기 상태 저장 (외부에서 로드한 경우)
        historyRef.current = [];
        historyIndexRef.current = -1;
        // 초기 상태를 히스토리에 저장
        setTimeout(() => {
          const initialState: HistoryState = {
            strokes: JSON.parse(JSON.stringify(newStrokes)),
            texts: JSON.parse(JSON.stringify(textsRef.current)),
          };
          historyRef.current = [initialState];
          historyIndexRef.current = 0;
        }, 0);
      },
      [onChange]
    );

    const loadTexts = useCallback((newTexts: TextItem[]) => {
      setTexts(newTexts);
      textsRef.current = newTexts;

      // 최대 Y 좌표 계산 (strokes와 texts 모두 고려)
      let maxYValue = 0;

      // strokes의 최대 Y 계산
      if (strokesRef.current.length > 0) {
        const strokesMaxY = Math.max(
          ...strokesRef.current.flatMap((stroke) => stroke.points.map((p) => p.y))
        );
        maxYValue = Math.max(maxYValue, strokesMaxY);
      }

      // texts의 최대 Y 계산
      if (newTexts.length > 0) {
        const textsMaxY = Math.max(...newTexts.map((text) => text.y));
        maxYValue = Math.max(maxYValue, textsMaxY);
      }

      if (maxYValue > 0) {
        maxY.current = maxYValue;
        canvasHeight.current = Math.max(800, maxY.current + 200);
      } else {
        maxY.current = 0;
        canvasHeight.current = 800;
      }

      setTick((t) => t + 1);
    }, []);

    // 텍스트 영역과 충돌하는지 확인 (32px 여백 포함, 캔버스 전체 너비, 멀티라인 고려)
    const isNearExistingText = useCallback(
      (y: number): boolean => {
        const safeDistance = 32; // 텍스트 주변 32px 보호 영역

        for (const textItem of texts) {
          // 실제 줄 수 계산
          const lineCount = calculateTextLineCount(textItem.text);
          const totalTextHeight = lineCount * textFontSize;

          // 텍스트 영역의 Y 범위 (32px 여백 포함, X는 캔버스 전체 너비)
          const textTop = textItem.y - textFontSize - safeDistance;
          const textBottom = textItem.y + totalTextHeight - textFontSize + safeDistance;

          // Y 좌표가 텍스트 영역 내에 있으면 캔버스 전체 너비에서 필기 차단
          if (y >= textTop && y <= textBottom) {
            return true;
          }
        }
        return false;
      },
      [texts, textFontSize, calculateTextLineCount]
    );

    const addPoint = useCallback(
      (x: number, y: number) => {
        // 텍스트 영역에서는 필기 차단
        if (isNearExistingText(y)) {
          return;
        }

        currentPoints.current.push({ x, y });
        // 최대 Y 좌표 업데이트
        if (y > maxY.current) {
          maxY.current = y;
          // 여유 공간을 위해 200px 추가
          canvasHeight.current = Math.max(800, maxY.current + 200);
          setTick((t) => t + 1);
        }
        // 경로는 매번 재생성하되, 렌더링은 최적화
        livePath.current = buildSmoothPath(currentPoints.current);
        setTick((t) => t + 1);
      },
      [isNearExistingText]
    );

    const startStroke = useCallback(
      (x: number, y: number) => {
        // 텍스트 영역에서는 필기 시작 차단
        if (isNearExistingText(y)) {
          return;
        }

        currentPoints.current = [{ x, y }];
        livePath.current = buildSmoothPath(currentPoints.current);
        setTick((t) => t + 1);
      },
      [isNearExistingText]
    );

    const finalizeStroke = useCallback(() => {
      if (currentPoints.current.length === 0) {
        livePath.current = Skia.Path.Make();
        setTick((t) => t + 1);
        return;
      }

      const pointsToFinalize = [...currentPoints.current];
      // 최대 Y 좌표 업데이트
      const strokeMaxY = Math.max(...pointsToFinalize.map((p) => p.y));
      if (strokeMaxY > maxY.current) {
        maxY.current = strokeMaxY;
        canvasHeight.current = Math.max(800, maxY.current + 200);
      }

      const newPath = buildSmoothPath(pointsToFinalize);
      const strokeData: Stroke = {
        points: pointsToFinalize,
        color: strokeColor,
        width: strokeWidth,
      };

      // 배치 업데이트: paths와 strokes를 함께 업데이트
      setStrokes((prev) => {
        const next = [...prev, strokeData];
        setPaths((prevPaths) => [...prevPaths, newPath]);
        strokesRef.current = next;
        onChange?.(next);
        setTick((t) => t + 1);

        // 히스토리에 저장
        setTimeout(() => saveToHistory(), 0);

        return next;
      });

      currentPoints.current = [];
      livePath.current = Skia.Path.Make();
    }, [strokeColor, strokeWidth, onChange, saveToHistory]);

    // 지우개: 터치한 위치에서 가까운 점들을 제거
    const eraseAtPoint = useCallback(
      (x: number, y: number) => {
        const now = Date.now();
        // Throttle: 너무 자주 호출되지 않도록 제한
        if (now - lastEraserTime.current < ERASER_THROTTLE_MS) {
          return;
        }
        lastEraserTime.current = now;

        const thresholdSquared = eraserSize * eraserSize; // 제곱 비교로 sqrt 제거

        setStrokes((prevStrokes) => {
          // 1. 지울 선들을 걸러냅니다. (선 위의 점 중 하나라도 지우개 반경에 닿으면 삭제)
          const nextStrokes = prevStrokes.filter((stroke) => {
            // 최적화: 제곱 거리 비교 (sqrt 제거)
            const isTouched = stroke.points.some((point) => {
              const dx = point.x - x;
              const dy = point.y - y;
              const distanceSquared = dx * dx + dy * dy;
              return distanceSquared < thresholdSquared;
            });
            return !isTouched; // 닿지 않은 선들만 남김
          });

          // 2. 만약 지워진 선이 있다면 Path 배열도 업데이트
          if (nextStrokes.length !== prevStrokes.length) {
            // 경로를 한 번에 생성
            const newPaths = nextStrokes.map((s) => buildSmoothPath(s.points));
            setPaths(newPaths);
            strokesRef.current = nextStrokes;
            onChange?.(nextStrokes);
            setTick((t) => t + 1);

            // 히스토리에 저장 (지우개 동작)
            setTimeout(() => saveToHistory(), 0);

            return nextStrokes;
          }

          return prevStrokes;
        });
      },
      [eraserSize, onChange, saveToHistory]
    );

    const addEraserPoint = useCallback(
      (x: number, y: number) => {
        eraserPoints.current.push({ x, y });
        eraseAtPoint(x, y);
      },
      [eraseAtPoint]
    );

    const startEraser = useCallback(
      (x: number, y: number) => {
        eraserPoints.current = [{ x, y }];
        eraseAtPoint(x, y);
      },
      [eraseAtPoint]
    );

    const finalizeEraser = useCallback(() => {
      eraserPoints.current = [];
    }, []);

    const deleteText = useCallback((textId: string) => {
      setTexts((prev) => {
        const next = prev.filter((t) => t.id !== textId);
        textsRef.current = next;
        return next;
      });
      setTick((t) => t + 1);
    }, []);

    // 필기(stroke) 위에 텍스트 박스를 생성할 수 있는지 확인
    // 필기 위는 차단 (캔버스 전체 너비), 필기 아래 16px부터는 허용
    const canAddTextAtPosition = useCallback(
      (y: number): boolean => {
        const minGap = 32; // 필기 아래 최소 16px 간격

        for (const stroke of strokes) {
          // stroke의 최대 Y 좌표 (가장 아래)
          const strokeMaxY = Math.max(...stroke.points.map((p) => p.y));

          // Y 좌표가 stroke보다 위에 있으면 차단 (X 좌표 무관, 캔버스 전체 너비)
          if (y < strokeMaxY + minGap) {
            return false; // 필기 위 또는 너무 가까움
          }
        }
        return true; // 텍스트 생성 가능
      },
      [strokes]
    );

    const addText = useCallback(
      (x: number, y: number) => {
        const padding = 16;
        const minGap = 32; // 필기 아래 32px

        // 가장 아래쪽 stroke 찾기
        let textY = padding; // 기본값: 캔버스 상단 16px

        if (strokes.length > 0) {
          // 모든 stroke의 최대 Y 좌표 찾기
          const maxStrokeY = Math.max(
            ...strokes.flatMap((stroke) => stroke.points.map((p) => p.y))
          );
          textY = maxStrokeY + minGap; // 가장 아래 필기 + 32px
        }

        // 기존 텍스트가 있으면 그 아래로 (멀티라인 고려)
        if (texts.length > 0) {
          const textBottoms = texts.map((text) => {
            const lineCount = calculateTextLineCount(text.text);
            const totalHeight = lineCount * textFontSize;
            return text.y + totalHeight - textFontSize;
          });
          const maxTextBottom = Math.max(...textBottoms);
          textY = Math.max(textY, maxTextBottom + minGap);
        }

        const textId = Date.now().toString();
        setActiveTextInput({
          id: textId,
          x: padding, // 항상 캔버스 왼쪽 끝(16px)에서 시작
          y: textY, // 가장 아래 필기/텍스트 아래 32px
          value: '',
        });

        // TextInput 포커스 및 키보드 처리
        setTimeout(() => {
          textInputRef.current?.focus();

          // 키보드가 올라올 때 텍스트 입력 위치로 스크롤
          const showListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
              keyboardHeight.current = e.endCoordinates.height;

              // 약간의 지연 후 스크롤 (레이아웃 업데이트 대기)
              setTimeout(() => {
                if (!containerLayout.current) return;

                // 텍스트 입력 위치 계산 (ScrollView 내부 기준)
                const textInputY = textY;
                const screenHeight = Dimensions.get('window').height;
                const keyboardTop = screenHeight - e.endCoordinates.height;

                // 컨테이너의 절대 위치 계산
                const containerY = containerLayout.current.y;
                const textInputAbsoluteY = containerY + textInputY;
                const textInputBottom = textInputAbsoluteY + textFontSize + 40; // 텍스트 높이 + 여백

                // 키보드가 텍스트 입력을 가릴 수 있는지 확인
                if (textInputBottom > keyboardTop) {
                  // 스크롤할 거리 계산 (키보드 위로 여유 공간 확보)
                  const scrollOffset = textInputBottom - keyboardTop + 20;

                  // ScrollView를 스크롤
                  scrollViewRef.current?.scrollTo({
                    y: Math.max(0, scrollOffset),
                    animated: true,
                  });
                }
              }, 100);
            }
          );

          // 키보드가 내려갈 때 리스너 제거
          const hideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
              keyboardHeight.current = 0;
              showListener.remove();
              hideListener.remove();
            }
          );
        }, 100);
      },
      [
        isNearExistingText,
        canAddTextAtPosition,
        strokes,
        texts,
        textFontSize,
        calculateTextLineCount,
      ]
    );

    const confirmTextInput = useCallback(() => {
      if (activeTextInput && activeTextInput.value.trim()) {
        const newText: TextItem = {
          id: activeTextInput.id,
          text: activeTextInput.value,
          x: activeTextInput.x,
          y: activeTextInput.y,
          fontSize: textFontSize,
          color: strokeColor,
        };
        // 최대 Y 좌표 업데이트
        if (activeTextInput.y > maxY.current) {
          maxY.current = activeTextInput.y;
          canvasHeight.current = Math.max(800, maxY.current + 200);
        }
        setTexts((prev) => {
          const next = [...prev, newText];
          textsRef.current = next;

          // 히스토리에 저장 (텍스트 추가)
          setTimeout(() => saveToHistory(), 0);

          return next;
        });
        setTick((t) => t + 1);
      }
      setActiveTextInput(null);
    }, [activeTextInput, textFontSize, strokeColor, saveToHistory]);

    const handleTextInputBlur = useCallback(() => {
      if (activeTextInput) {
        confirmTextInput();
      }
    }, [activeTextInput, confirmTextInput]);

    const handleTextInputChange = useCallback(
      (text: string) => {
        if (activeTextInput) {
          setActiveTextInput((prev) => (prev ? { ...prev, value: text } : null));
        }
      },
      [activeTextInput]
    );

    const undo = useCallback(() => {
      // 활성 텍스트 입력이 있으면 먼저 취소
      if (activeTextInput) {
        setActiveTextInput(null);
        return;
      }

      // 히스토리에서 이전 상태로 복원
      if (historyIndexRef.current > 0) {
        historyIndexRef.current--;
        restoreFromHistory(historyIndexRef.current);
      } else if (historyIndexRef.current === 0) {
        // 첫 번째 상태로 복원 (빈 상태)
        historyIndexRef.current = -1;
        restoreFromHistory(0);
      }
      // historyIndexRef.current === -1이면 undo할 히스토리가 없음
    }, [activeTextInput, restoreFromHistory]);

    const redo = useCallback(() => {
      // 활성 텍스트 입력이 있으면 redo 불가
      if (activeTextInput) {
        return;
      }

      // 히스토리에서 다음 상태로 복원
      const nextIndex = historyIndexRef.current + 1;
      if (nextIndex < historyRef.current.length) {
        historyIndexRef.current = nextIndex;
        restoreFromHistory(nextIndex);
      }
      // nextIndex >= historyRef.current.length이면 redo할 히스토리가 없음
    }, [activeTextInput, restoreFromHistory]);

    // 초기 상태를 히스토리에 저장
    useEffect(() => {
      if (historyRef.current.length === 0) {
        const initialState: HistoryState = {
          strokes: [],
          texts: [],
        };
        historyRef.current = [initialState];
        historyIndexRef.current = 0;
        notifyHistoryChange();
      }
    }, [notifyHistoryChange]);

    // activeTextInput 상태 변경 시 히스토리 상태 알림
    useEffect(() => {
      notifyHistoryChange();
    }, [activeTextInput, notifyHistoryChange]);

    useImperativeHandle(ref, () => ({
      clear() {
        setPaths([]);
        setStrokes([]);
        setTexts([]);
        setActiveTextInput(null);
        strokesRef.current = [];
        textsRef.current = [];
        livePath.current = Skia.Path.Make();
        maxY.current = 0;
        canvasHeight.current = 800;
        setTick((t) => t + 1);
        onChange?.([]);

        // 히스토리 초기화
        historyRef.current = [];
        historyIndexRef.current = -1;
      },
      undo,
      redo,
      canUndo: () => {
        // 활성 텍스트 입력이 있으면 undo 가능
        if (activeTextInput) return true;
        // 히스토리 인덱스가 0보다 크면 undo 가능 (이전 상태가 있음)
        if (historyIndexRef.current > 0) return true;
        // 초기 상태만 있고 실제 변경이 없으면 undo 불가능
        // 히스토리가 1개만 있으면 (초기 상태만) undo 불가능
        if (historyRef.current.length === 1) return false;
        // 히스토리가 2개 이상이면 undo 가능
        return historyIndexRef.current === 0 && historyRef.current.length > 1;
      },
      canRedo: () => {
        // 활성 텍스트 입력이 있으면 redo 불가
        if (activeTextInput) return false;
        // 다음 히스토리가 있으면 redo 가능
        return historyIndexRef.current + 1 < historyRef.current.length;
      },
      getStrokes: () => strokesRef.current,
      setStrokes: loadStrokes,
      getTexts: () => textsRef.current,
      setTexts: loadTexts,
    }));

    const tap = useMemo(
      () =>
        Gesture.Tap().onEnd((e) => {
          'worklet';
          // 텍스트 입력은 손가락도 허용 (모든 입력 타입 허용)
          if (textMode && !eraserMode) {
            runOnJS(addText)(e.x, e.y);
          }
        }),
      [textMode, eraserMode, addText]
    );

    const pan = useMemo(
      () =>
        Gesture.Pan()
          .minPointers(1)
          .maxPointers(1) // 한 손가락만 허용 (두 손가락은 스크롤)
          .onBegin((e) => {
            'worklet';
            // 펜슬만 허용 (제스처 이벤트에서 직접 pointerType 확인)
            const pointerType = e.pointerType;
            if (pointerType !== PointerType.STYLUS && pointerType !== PointerType.MOUSE) {
              return;
            }
            showHover.value = false; // 그리기 시작 시 호버 숨김
            if (textMode) return; // 텍스트 모드에서는 그리기 비활성화
            if (eraserMode) {
              runOnJS(startEraser)(e.x, e.y);
            } else {
              runOnJS(startStroke)(e.x, e.y);
            }
          })
          .onUpdate((e) => {
            'worklet';
            // 펜슬만 허용 (제스처 이벤트에서 직접 pointerType 확인)
            const pointerType = e.pointerType;
            if (pointerType !== PointerType.STYLUS && pointerType !== PointerType.MOUSE) {
              return;
            }
            if (textMode) return;
            if (eraserMode) {
              runOnJS(addEraserPoint)(e.x, e.y);
            } else {
              runOnJS(addPoint)(e.x, e.y);
            }
          })
          .onEnd(() => {
            'worklet';
            if (textMode) return;
            if (eraserMode) {
              runOnJS(finalizeEraser)();
            } else {
              runOnJS(finalizeStroke)();
            }
          })
          .minDistance(1),
      [
        textMode,
        eraserMode,
        startStroke,
        addPoint,
        finalizeStroke,
        startEraser,
        addEraserPoint,
        finalizeEraser,
      ]
    );

    // 호버 제스처 (펜슬/마우스에서만 작동)
    const hoverGesture = useMemo(
      () =>
        Gesture.Hover()
          .onBegin((e) => {
            'worklet';
            // 펜슬/마우스에서만 호버 표시
            const pointerType = e.pointerType;
            if (pointerType === PointerType.STYLUS || pointerType === PointerType.MOUSE) {
              hoverX.value = e.x;
              hoverY.value = e.y;
              showHover.value = true;
            }
          })
          .onUpdate((e) => {
            'worklet';
            // 펜슬/마우스에서만 호버 표시
            const pointerType = e.pointerType;
            if (pointerType === PointerType.STYLUS || pointerType === PointerType.MOUSE) {
              hoverX.value = e.x;
              hoverY.value = e.y;
              showHover.value = true;
            } else {
              showHover.value = false;
            }
          })
          .onEnd(() => {
            'worklet';
            showHover.value = false;
          })
          .onFinalize(() => {
            'worklet';
            showHover.value = false;
          }),
      []
    );

    // 호버 opacity를 위한 derived value
    const hoverOpacity = useDerivedValue(() => {
      return showHover.value ? 0.6 : 0;
    }, [showHover]);

    const composedGesture = useMemo(
      () => Gesture.Simultaneous(Gesture.Race(tap, pan), hoverGesture),
      [tap, pan, hoverGesture]
    );

    // 경로 렌더링 최적화: paths 배열이 변경될 때만 재렌더링
    // 각 stroke는 저장된 width와 color를 사용
    const renderedPaths = useMemo(
      () =>
        paths.map((p, i) => {
          const stroke = strokes[i];
          return (
            <Path
              key={`path-${i}-${paths.length}`}
              path={p}
              style='stroke'
              strokeWidth={stroke?.width || strokeWidth}
              color={stroke?.color || strokeColor}
              strokeCap='round'
              strokeJoin='round'
            />
          );
        }),
      [paths, strokes, strokeWidth, strokeColor]
    );

    // 텍스트 렌더링 최적화 (멀티라인 지원 + 자동 줄바꿈)
    const renderedTexts = useMemo(
      () =>
        font
          ? texts.flatMap((textItem) => {
              const maxWidth = Dimensions.get('window').width * 0.5 - 40;
              const allLines: string[] = [];

              // 먼저 명시적 줄바꿈으로 분할
              const paragraphs = textItem.text.split('\n');

              // 각 문단을 너비 기준으로 추가 분할
              paragraphs.forEach((paragraph) => {
                if (!paragraph) {
                  allLines.push(''); // 빈 줄 유지
                  return;
                }

                const words = paragraph.split(' ');
                let currentLine = '';

                words.forEach((word, idx) => {
                  const testLine = currentLine ? `${currentLine} ${word}` : word;
                  const textWidth = font.measureText(testLine).width;

                  if (textWidth > maxWidth && currentLine) {
                    // 현재 줄이 최대 너비를 초과하면 줄바꿈
                    allLines.push(currentLine);
                    currentLine = word;
                  } else {
                    currentLine = testLine;
                  }

                  // 마지막 단어인 경우 현재 줄 추가
                  if (idx === words.length - 1) {
                    allLines.push(currentLine);
                  }
                });
              });

              return allLines.map((line, lineIndex) => (
                <Text
                  key={`${textItem.id}-line-${lineIndex}`}
                  x={textItem.x}
                  y={textItem.y + lineIndex * textFontSize}
                  text={line}
                  font={font}
                  color={textItem.color}
                />
              ));
            })
          : null,
      [texts, font, textFontSize]
    );

    // 텍스트 삭제 버튼 렌더링 (텍스트 모드일 때만, 텍스트 시작 위치에 배치)
    const renderedTextDeleteButtons = useMemo(() => {
      if (!textMode || eraserMode) return null;

      return texts.map((textItem) => {
        const buttonSize = 20;
        const buttonX = textItem.x - buttonSize + 10; // 텍스트 시작 왼쪽에 배치
        const buttonY = textItem.y - textFontSize + (textFontSize - buttonSize) / 2 + 10;

        return (
          <Pressable
            key={`delete-${textItem.id}`}
            style={[
              styles.deleteButton,
              {
                left: buttonX,
                top: buttonY,
                width: buttonSize,
                height: buttonSize,
              },
            ]}
            onPress={() => deleteText(textItem.id)}>
            <RNText style={styles.deleteButtonText}>×</RNText>
          </Pressable>
        );
      });
    }, [texts, textMode, eraserMode, textFontSize, deleteText]);

    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps='handled'>
        <GestureDetector gesture={composedGesture}>
          <View
            style={styles.container}
            collapsable={false}
            onLayout={(e) => {
              const { x, y, width, height } = e.nativeEvent.layout;
              containerLayout.current = { x, y, width, height };
            }}>
            <Canvas style={[styles.canvas, { height: canvasHeight.current }]}>
              {renderedPaths}
              {currentPoints.current.length > 0 && (
                <Path
                  path={livePath.current}
                  style='stroke'
                  strokeWidth={strokeWidth}
                  color={strokeColor}
                  strokeCap='round'
                  strokeJoin='round'
                />
              )}
              {renderedTexts}

              <Group>
                <Circle
                  cx={hoverX}
                  cy={hoverY}
                  r={eraserMode ? eraserSize : strokeWidth / 2}
                  color={eraserMode ? '#e2e2e2' : strokeColor}
                  opacity={hoverOpacity}
                  style='stroke'
                  strokeWidth={1.5}
                />
              </Group>
            </Canvas>

            {/* 인라인 텍스트 입력 박스 */}
            {activeTextInput && (
              <View
                style={[
                  styles.textInputWrapper,
                  {
                    left: Math.max(
                      0,
                      Math.min(activeTextInput.x, (containerLayout.current?.width || 400) - 200)
                    ),
                    top: Math.max(
                      16,
                      Math.min(
                        activeTextInput.y - textFontSize,
                        (containerLayout.current?.height || 400) - 16 - textFontSize
                      )
                    ),
                  },
                ]}
                onLayout={(e) => {}}>
                <TextInput
                  ref={textInputRef}
                  style={[
                    styles.inlineTextInput,
                    {
                      fontSize: textFontSize,
                      color: strokeColor,
                    },
                  ]}
                  value={activeTextInput.value}
                  onChangeText={handleTextInputChange}
                  placeholder='텍스트 입력'
                  placeholderTextColor='#9CA3AF'
                  multiline
                  autoFocus
                  onBlur={handleTextInputBlur}
                  blurOnSubmit={false}
                />
              </View>
            )}

            {/* 텍스트 삭제 버튼 */}
            {renderedTextDeleteButtons}
          </View>
        </GestureDetector>
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: { minHeight: 400, position: 'relative' },
  canvas: { width: '100%', backgroundColor: 'white' },
  textInputWrapper: {
    position: 'absolute',
    backgroundColor: 'transparent',
    maxWidth: Dimensions.get('window').width * 0.5 - 40,
  },
  inlineTextInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    textAlignVertical: 'top',
    width: '100%', // wrapper의 maxWidth에 맞춰서 자동 줄바꿈
  },
  deleteButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});

export default React.memo(DrawingCanvas);
