import { Skia, type SkPath } from '@shopify/react-native-skia';

import { type Point } from './model/drawingTypes';

export function buildSmoothPath(points: Point[]): SkPath {
  const path = Skia.Path.Make();
  if (points.length === 0) return path;

  // 첫 번째 점으로 이동
  path.moveTo(points[0].x, points[0].y);

  if (points.length < 3) {
    // 점이 2개뿐일 때는 단순 직선 연결
    if (points.length === 2) {
      path.lineTo(points[1].x, points[1].y);
    }
    return path;
  }

  // 쿼드라틱 베지에 곡선(Quadratic Bezier)을 이용한 부드러운 경로 생성
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];

    // 좌표값이 유효한지 확인 (NaN 방지)
    if (isNaN(p0.x) || isNaN(p0.y) || isNaN(p1.x) || isNaN(p1.y)) continue;

    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;

    // p0를 제어점으로 사용하고 mid point를 종착점으로 사용하여 부드럽게 연결
    path.quadTo(p0.x, p0.y, midX, midY);
  }

  // 마지막 점까지 연결
  const lastPoint = points[points.length - 1];
  path.lineTo(lastPoint.x, lastPoint.y);

  return path;
}
