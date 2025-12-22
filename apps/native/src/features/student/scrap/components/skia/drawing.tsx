import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Dimensions,
  Pressable,
  Text as RNText,
  ScrollView,
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
  getStrokes: () => Stroke[];
};

type Props = {
  strokeColor?: string;
  strokeWidth?: number;
  onChange?: (strokes: Stroke[]) => void;
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
    const containerLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(
      null
    );
    const canvasHeight = useRef<number>(800); // 기본 캔버스 높이
    const maxY = useRef<number>(0); // 그려진 내용의 최대 Y 좌표

    // 호버 좌표를 저장할 SharedValue (성능을 위해 스레드 분리)
    const hoverX = useSharedValue(0);
    const hoverY = useSharedValue(0);
    const showHover = useSharedValue(false);

    const livePath = useRef<SkPath>(Skia.Path.Make());
    const currentPoints = useRef<Point[]>([]);
    const strokesRef = useRef<Stroke[]>([]);
    const eraserPoints = useRef<Point[]>([]);
    const lastEraserTime = useRef<number>(0);
    const ERASER_THROTTLE_MS = 16; // ~60fps

    // 폰트 로드
    const font = useFont(require('@assets/fonts/PretendardVariable.ttf'), textFontSize);

    const addPoint = useCallback((x: number, y: number) => {
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
    }, []);

    const startStroke = useCallback((x: number, y: number) => {
      currentPoints.current = [{ x, y }];
      livePath.current = buildSmoothPath(currentPoints.current);
      setTick((t) => t + 1);
    }, []);

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
        return next;
      });

      currentPoints.current = [];
      livePath.current = Skia.Path.Make();
    }, [strokeColor, strokeWidth, onChange]);

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
            return nextStrokes;
          }

          return prevStrokes;
        });
      },
      [eraserSize, onChange]
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
      setTexts((prev) => prev.filter((t) => t.id !== textId));
      setTick((t) => t + 1);
    }, []);

    // 텍스트 영역과 충돌하는지 확인 (16px 여백 포함)
    const isNearExistingText = useCallback(
      (x: number, y: number): boolean => {
        const safeDistance = 16;
        const buttonSize = 20;

        for (const textItem of texts) {
          // 텍스트 너비 추정
          const estimatedCharWidth = textFontSize * 0.6;
          const textWidth = textItem.text.length * estimatedCharWidth;
          const textHeight = textFontSize;

          // 텍스트 영역 (16px 여백 포함)
          const textLeft = textItem.x - safeDistance;
          const textRight = textItem.x + textWidth + safeDistance + buttonSize + 4; // X 버튼 포함
          const textTop = textItem.y - textHeight - safeDistance;
          const textBottom = textItem.y + safeDistance;

          // 클릭한 위치가 텍스트 영역 내에 있는지 확인
          if (x >= textLeft && x <= textRight && y >= textTop && y <= textBottom) {
            return true;
          }
        }
        return false;
      },
      [texts, textFontSize]
    );

    const addText = useCallback(
      (x: number, y: number) => {
        // 기존 텍스트 주변 16px 내에서는 새 텍스트 박스 생성 안 함
        if (isNearExistingText(x, y)) {
          return;
        }

        // 상하 16px 여백 고려
        const padding = 16;
        const adjustedY = Math.max(
          padding,
          Math.min(y, (containerLayout.current?.height || 400) - padding)
        );

        const textId = Date.now().toString();
        setActiveTextInput({
          id: textId,
          x: x,
          y: adjustedY,
          value: '',
        });

        // TextInput 포커스
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 100);
      },
      [isNearExistingText]
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
        setTexts((prev) => [...prev, newText]);
        setTick((t) => t + 1);
      }
      setActiveTextInput(null);
    }, [activeTextInput, textFontSize, strokeColor]);

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

      // 텍스트가 있으면 텍스트부터 제거, 없으면 스트로크 제거
      setTexts((prev) => {
        if (prev.length > 0) {
          setTick((t) => t + 1);
          return prev.slice(0, -1);
        }
        return prev;
      });

      if (texts.length === 0) {
        setStrokes((prev) => {
          if (prev.length === 0) return prev;
          const next = prev.slice(0, -1);
          // paths도 함께 업데이트
          setPaths((prevPaths) => prevPaths.slice(0, -1));
          strokesRef.current = next;
          onChange?.(next);
          setTick((t) => t + 1);
          return next;
        });
      }
    }, [onChange, texts.length, activeTextInput]);

    useImperativeHandle(ref, () => ({
      clear() {
        setPaths([]);
        setStrokes([]);
        setTexts([]);
        setActiveTextInput(null);
        strokesRef.current = [];
        livePath.current = Skia.Path.Make();
        maxY.current = 0;
        canvasHeight.current = 800;
        setTick((t) => t + 1);
      },
      undo,
      getStrokes: () => strokesRef.current,
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

    // 텍스트 렌더링 최적화
    const renderedTexts = useMemo(
      () =>
        font
          ? texts.map((textItem) => (
              <Text
                key={textItem.id}
                x={textItem.x}
                y={textItem.y}
                text={textItem.text}
                font={font}
                color={textItem.color}
              />
            ))
          : null,
      [texts, font]
    );

    // 텍스트 삭제 버튼 렌더링 (텍스트 모드일 때만)
    const renderedTextDeleteButtons = useMemo(() => {
      if (!textMode || eraserMode) return null;

      return texts.map((textItem) => {
        // 텍스트 너비 추정
        const estimatedCharWidth = textFontSize * 0.8;
        const textWidth = textItem.text.length * estimatedCharWidth;
        const buttonSize = 20;
        const buttonX = textItem.x + textWidth + 4;
        const buttonY = textItem.y - textFontSize + (textFontSize - buttonSize) / 2;

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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}>
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
                ]}>
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
    minWidth: 200,
    maxWidth: Dimensions.get('window').width * 0.4 - 40,
  },
  inlineTextInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    textAlignVertical: 'top',
    width: '100%',
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
