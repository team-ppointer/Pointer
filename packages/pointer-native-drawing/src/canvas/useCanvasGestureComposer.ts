import { useMemo } from 'react';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { type ViewTransform, IDENTITY_TRANSFORM, clampTransform } from '../transform';

export type UseCanvasGestureComposerArgs = {
  enableZoomPan: boolean;
  maxZoomScale: number;
  nativeFingerInput?: boolean;
  viewTransform: SharedValue<ViewTransform>;
  viewportWidthShared: SharedValue<number>;
  viewportHeightShared: SharedValue<number>;
  canvasHeightShared: SharedValue<number>;
  drawPanGesture: GestureType;
};

export function useCanvasGestureComposer({
  enableZoomPan,
  maxZoomScale,
  nativeFingerInput = false,
  viewTransform,
  viewportWidthShared,
  viewportHeightShared,
  canvasHeightShared,
  drawPanGesture,
}: UseCanvasGestureComposerArgs) {
  // gesture 간 협업용 SharedValues
  const pinchDeadShared = useSharedValue(false);
  const pinchActiveShared = useSharedValue(false);

  // base/anchor SharedValue — pinch start 시점의 transform / focal anchor 저장
  const baseTransformShared = useSharedValue<ViewTransform>(IDENTITY_TRANSFORM);
  const anchorXShared = useSharedValue(0);
  const anchorYShared = useSharedValue(0);

  const fingerPanBaseShared = useSharedValue<ViewTransform>(IDENTITY_TRANSFORM);
  const fingerPanActiveShared = useSharedValue(false);

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onStart((e) => {
          'worklet';
          pinchDeadShared.value = false;
          pinchActiveShared.value = true;
          const current = viewTransform.value;
          baseTransformShared.value = current;
          const s = current.scale || 1;
          anchorXShared.value = (e.focalX - current.translateX) / s;
          anchorYShared.value = (e.focalY - current.translateY) / s;
        })
        .onUpdate((e) => {
          'worklet';
          if (e.numberOfPointers < 2) {
            pinchDeadShared.value = true;
            return;
          }
          if (pinchDeadShared.value) return;

          const base = baseTransformShared.value;
          const newScale = Math.min(Math.max(base.scale * e.scale, 1), maxZoomScale);
          const next: ViewTransform = {
            scale: newScale,
            translateX: e.focalX - newScale * anchorXShared.value,
            translateY: e.focalY - newScale * anchorYShared.value,
          };
          viewTransform.value = clampTransform(
            next,
            viewportWidthShared.value,
            canvasHeightShared.value,
            viewportWidthShared.value,
            viewportHeightShared.value,
            maxZoomScale
          );
        })
        .onEnd(() => {
          'worklet';
          pinchActiveShared.value = false;
          // 마지막 clamp 한 번 더 (boundary 보정)
          viewTransform.value = clampTransform(
            viewTransform.value,
            viewportWidthShared.value,
            canvasHeightShared.value,
            viewportWidthShared.value,
            viewportHeightShared.value,
            maxZoomScale
          );
        })
        .onFinalize(() => {
          'worklet';
          pinchActiveShared.value = false;
        }),
    [
      viewTransform,
      viewportWidthShared,
      viewportHeightShared,
      canvasHeightShared,
      pinchDeadShared,
      pinchActiveShared,
      baseTransformShared,
      anchorXShared,
      anchorYShared,
      maxZoomScale,
    ]
  );

  const fingerPanGesture = useMemo(
    () =>
      Gesture.Pan()
        .minPointers(2)
        .maxPointers(2)
        .minDistance(1)
        .onStart(() => {
          'worklet';
          if (pinchActiveShared.value) return;
          fingerPanActiveShared.value = true;
          fingerPanBaseShared.value = viewTransform.value;
        })
        .onUpdate((e) => {
          'worklet';
          if (pinchActiveShared.value) return;
          if (!fingerPanActiveShared.value) return;
          const base = fingerPanBaseShared.value;
          const next: ViewTransform = {
            scale: base.scale,
            translateX: base.translateX + e.translationX,
            translateY: base.translateY + e.translationY,
          };
          viewTransform.value = clampTransform(
            next,
            viewportWidthShared.value,
            canvasHeightShared.value,
            viewportWidthShared.value,
            viewportHeightShared.value,
            maxZoomScale
          );
        })
        .onFinalize(() => {
          'worklet';
          fingerPanActiveShared.value = false;
        }),
    [
      viewTransform,
      viewportWidthShared,
      viewportHeightShared,
      canvasHeightShared,
      pinchActiveShared,
      fingerPanActiveShared,
      fingerPanBaseShared,
      maxZoomScale,
    ]
  );

  const composedGesture = useMemo(() => {
    if (!enableZoomPan) {
      return drawPanGesture;
    }
    if (nativeFingerInput) {
      // native overlay가 finger touch를 받는 경우 — pinch/finger pan은 native 측 처리.
      // RNGH는 stylus draw만, zoom은 native에서 별도 게스처로.
      return drawPanGesture;
    }
    return Gesture.Simultaneous(drawPanGesture, fingerPanGesture, pinchGesture);
  }, [enableZoomPan, nativeFingerInput, drawPanGesture, fingerPanGesture, pinchGesture]);

  return { composedGesture };
}
