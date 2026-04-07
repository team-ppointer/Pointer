import { Skia, SkPath } from '@shopify/react-native-skia';

type Point = { x: number; y: number };

const CATMULL_ROM_CONTROL_RATIO = 1 / 6;

const isValidPoint = (point: Point): boolean =>
  Number.isFinite(point.x) && Number.isFinite(point.y);

export function buildSmoothPath(points: Point[]): SkPath {
  const path = Skia.Path.Make();
  if (points.length === 0) return path;

  const firstPoint = points[0];
  if (!isValidPoint(firstPoint)) {
    return path;
  }

  path.moveTo(firstPoint.x, firstPoint.y);

  if (points.length === 1) {
    return path;
  }

  if (points.length < 3) {
    const secondPoint = points[1];
    if (isValidPoint(secondPoint)) {
      path.lineTo(secondPoint.x, secondPoint.y);
    }
    return path;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const previous = i === 0 ? points[i] : points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    const nextNext = i + 2 < points.length ? points[i + 2] : next;

    if (
      !isValidPoint(previous) ||
      !isValidPoint(current) ||
      !isValidPoint(next) ||
      !isValidPoint(nextNext)
    ) {
      continue;
    }

    const controlPoint1X = current.x + (next.x - previous.x) * CATMULL_ROM_CONTROL_RATIO;
    const controlPoint1Y = current.y + (next.y - previous.y) * CATMULL_ROM_CONTROL_RATIO;
    const controlPoint2X = next.x - (nextNext.x - current.x) * CATMULL_ROM_CONTROL_RATIO;
    const controlPoint2Y = next.y - (nextNext.y - current.y) * CATMULL_ROM_CONTROL_RATIO;

    path.cubicTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, next.x, next.y);
  }

  return path;
}
