import {
  PaintStyle,
  SkPath,
  SkPicture,
  Skia,
  StrokeCap,
  StrokeJoin,
} from "@shopify/react-native-skia";
import type { ReadonlyPoint, ReadonlyStroke } from "../../model/drawingTypes";
import { centripetalControlPoints } from "../../smoothing";

export const PICTURE_CACHE_STROKE_THRESHOLD = 120;
export const LIVE_FULL_REBUILD_POINT_THRESHOLD = 240;

export const createCommittedPicture = (
  paths: SkPath[],
  strokes: ReadonlyArray<ReadonlyStroke>,
): SkPicture | null => {
  if (paths.length === 0) {
    return null;
  }

  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording();
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setStrokeJoin(StrokeJoin.Round);

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const stroke = strokes[i];
    if (!stroke) {
      continue;
    }

    const hasVariableWidth = stroke.samples && stroke.samples.length > 0;
    paint.setStyle(hasVariableWidth ? PaintStyle.Fill : PaintStyle.Stroke);
    paint.setColor(Skia.Color(stroke.color));
    if (!hasVariableWidth) {
      paint.setStrokeWidth(stroke.width);
      paint.setStrokeCap(
        stroke.strokeCap === "butt" ? StrokeCap.Butt : StrokeCap.Round,
      );
    }
    paint.setAlphaf(stroke.opacity ?? 1);
    canvas.drawPath(path, paint);
  }

  return recorder.finishRecordingAsPicture();
};

export const appendLiveSmoothSegment = (
  path: SkPath,
  points: ReadonlyArray<ReadonlyPoint>,
  index: number,
): boolean => {
  if (index < 0 || index >= points.length - 1) {
    return false;
  }

  const current = points[index];
  const next = points[index + 1];
  const previous = index > 0
    ? points[index - 1]
    : { x: 2 * current.x - next.x, y: 2 * current.y - next.y };
  const nextNext = index + 2 < points.length
    ? points[index + 2]
    : { x: 2 * next.x - current.x, y: 2 * next.y - current.y };

  if (
    !Number.isFinite(previous.x) ||
    !Number.isFinite(previous.y) ||
    !Number.isFinite(current.x) ||
    !Number.isFinite(current.y) ||
    !Number.isFinite(next.x) ||
    !Number.isFinite(next.y) ||
    !Number.isFinite(nextNext.x) ||
    !Number.isFinite(nextNext.y)
  ) {
    return false;
  }

  const { cp1x, cp1y, cp2x, cp2y } = centripetalControlPoints(previous, current, next, nextNext);

  path.cubicTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
  return true;
};
