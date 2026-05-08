/**
 * View transform utilities for zoom/pan support.
 * 모든 함수는 worklet 호환 (UI thread 호출 가능).
 */

export type ViewTransform = {
  scale: number;
  translateX: number;
  translateY: number;
};

export const IDENTITY_TRANSFORM: ViewTransform = {
  scale: 1,
  translateX: 0,
  translateY: 0,
};

/** Convert screen (view) coordinates to canvas coordinates. */
export function screenToCanvas(
  sx: number,
  sy: number,
  transform: ViewTransform
): { x: number; y: number } {
  'worklet';
  const s = transform.scale || 1; // 240 명시 fix: 0/NaN guard
  return {
    x: (sx - transform.translateX) / s,
    y: (sy - transform.translateY) / s,
  };
}

/** Convert canvas coordinates to screen (view) coordinates. */
export function canvasToScreen(
  cx: number,
  cy: number,
  transform: ViewTransform
): { x: number; y: number } {
  'worklet';
  return {
    x: cx * transform.scale + transform.translateX,
    y: cy * transform.scale + transform.translateY,
  };
}

/** Clamp a transform so the canvas stays within viewport bounds. */
export function clampTransform(
  transform: ViewTransform,
  canvasW: number,
  canvasH: number,
  vpW: number,
  vpH: number,
  maxScale: number
): ViewTransform {
  'worklet';
  if (canvasW <= 0 || canvasH <= 0 || vpW <= 0 || vpH <= 0) {
    return transform;
  }
  const minScale = Math.min(1, vpW / canvasW);
  const scale = Math.min(Math.max(transform.scale, minScale), maxScale);

  const minTx = vpW - canvasW * scale;
  const minTy = vpH - canvasH * scale;

  const translateX = Math.min(0, Math.max(minTx, transform.translateX));
  const translateY = Math.min(0, Math.max(minTy, transform.translateY));

  return { scale, translateX, translateY };
}

/** Skia matrix array (3x3 row-major) for `<Group matrix={...}>`. */
export function transformToMatrix3(transform: ViewTransform): number[] {
  'worklet';
  return [
    transform.scale,
    0,
    transform.translateX,
    0,
    transform.scale,
    transform.translateY,
    0,
    0,
    1,
  ];
}
