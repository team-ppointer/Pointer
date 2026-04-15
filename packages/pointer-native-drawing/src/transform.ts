/**
 * View transform utilities for zoom/pan support.
 * Pure functions — no React dependency.
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
  transform: ViewTransform,
): { x: number; y: number } {
  const s = transform.scale || 1;
  return {
    x: (sx - transform.translateX) / s,
    y: (sy - transform.translateY) / s,
  };
}

/** Convert canvas coordinates to screen (view) coordinates. */
export function canvasToScreen(
  cx: number,
  cy: number,
  transform: ViewTransform,
): { x: number; y: number } {
  return {
    x: cx * transform.scale + transform.translateX,
    y: cy * transform.scale + transform.translateY,
  };
}

/**
 * Clamp a transform so the canvas stays within viewport bounds.
 *
 * - minScale: viewport fits canvas width (vpW / canvasW), clamped to 1 minimum
 * - maxScale: caller-provided upper bound
 * - translateX: [vpW - canvasW*scale, 0]
 * - translateY: [vpH - canvasH*scale, 0]
 */
export function clampTransform(
  transform: ViewTransform,
  canvasW: number,
  canvasH: number,
  vpW: number,
  vpH: number,
  maxScale: number,
): ViewTransform {
  // TODO: canvasW/canvasH가 0 이하일 때 NaN 전파 방지 — early return으로 identity transform 반환 필요
  const minScale = Math.min(1, vpW / canvasW);
  const scale = Math.min(Math.max(transform.scale, minScale), maxScale);

  const minTx = vpW - canvasW * scale;
  const minTy = vpH - canvasH * scale;

  const translateX = Math.min(0, Math.max(minTx, transform.translateX));
  const translateY = Math.min(0, Math.max(minTy, transform.translateY));

  return { scale, translateX, translateY };
}

/** Convert ViewTransform to a Skia-compatible 3x3 row-major matrix. */
export function transformToMatrix3(transform: ViewTransform): number[] {
  // Skia Matrix uses row-major order:
  // [scaleX, skewX, transX, skewY, scaleY, transY, persp0, persp1, persp2]
  return [
    transform.scale, 0, transform.translateX,
    0, transform.scale, transform.translateY,
    0, 0, 1,
  ];
}
