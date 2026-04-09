import React, { RefObject, useMemo } from "react";
import { Canvas, CanvasRef, Circle, Path, Picture, SkPath } from "@shopify/react-native-skia";
import type { ReadonlyStroke, ReadonlyStrokeBounds } from "../../model/drawingTypes";
import {
  createCommittedPicture,
  PICTURE_CACHE_STROKE_THRESHOLD,
} from "./skiaDrawingUtils";

const VIEWPORT_CULLING_MARGIN = 280;
const CANVAS_STYLE = { flex: 1 } as const;

type SkiaDrawingCanvasSurfaceProps = {
  paths: SkPath[];
  strokes: ReadonlyArray<ReadonlyStroke>;
  strokeBounds: ReadonlyArray<ReadonlyStrokeBounds>;
  strokeColor: string;
  normalizedPenStrokeWidth: number;
  livePath: SkPath;
  isLiveStrokeActive: boolean;
  isLivePathVariableWidth: boolean;
  fixedWidthMode: boolean;
  eraserCursor?: { x: number; y: number } | null;
  eraserSize?: number;
  canvasRef: RefObject<CanvasRef | null>;
  scrollOffsetY: number;
  viewportHeight: number;
};

const isStrokeVisible = (
  bounds: ReadonlyStrokeBounds,
  scrollOffsetY: number,
  viewportHeight: number,
): boolean => {
  if (viewportHeight <= 0) return true;
  const top = scrollOffsetY - VIEWPORT_CULLING_MARGIN;
  const bottom = scrollOffsetY + viewportHeight + VIEWPORT_CULLING_MARGIN;
  return bounds.maxY >= top && bounds.minY <= bottom;
};

export const SkiaDrawingCanvasSurface = React.memo(function SkiaDrawingCanvasSurface({
  paths,
  strokes,
  strokeBounds,
  strokeColor,
  normalizedPenStrokeWidth,
  livePath,
  isLiveStrokeActive,
  isLivePathVariableWidth,
  fixedWidthMode,
  eraserCursor,
  eraserSize,
  canvasRef,
  scrollOffsetY,
  viewportHeight,
}: SkiaDrawingCanvasSurfaceProps) {
  const renderedPaths = useMemo(() => {
    if (paths.length >= PICTURE_CACHE_STROKE_THRESHOLD) {
      return null;
    }

    return paths.map((path, index) => {
      const bounds = strokeBounds[index];
      if (bounds && !isStrokeVisible(bounds, scrollOffsetY, viewportHeight)) {
        return null;
      }

      const stroke = strokes[index];
      const hasVariableWidth = !fixedWidthMode && stroke?.samples && stroke.samples.length > 0;
      return (
        <Path
          key={`path-${index}`}
          path={path}
          style={hasVariableWidth ? "fill" : "stroke"}
          strokeWidth={hasVariableWidth ? 0 : (stroke?.width ?? normalizedPenStrokeWidth)}
          color={stroke?.color ?? strokeColor}
          strokeCap={stroke?.strokeCap ?? "round"}
          strokeJoin="round"
          opacity={stroke?.opacity ?? 1}
          antiAlias
        />
      );
    });
  }, [fixedWidthMode, normalizedPenStrokeWidth, paths, scrollOffsetY, strokeBounds, strokeColor, strokes, viewportHeight]);

  const committedPicture = useMemo(
    () => {
      if (paths.length < PICTURE_CACHE_STROKE_THRESHOLD) return null;

      const visiblePaths: SkPath[] = [];
      const visibleStrokes: ReadonlyStroke[] = [];
      for (let i = 0; i < paths.length; i++) {
        const bounds = strokeBounds[i];
        if (bounds && !isStrokeVisible(bounds, scrollOffsetY, viewportHeight)) {
          continue;
        }
        visiblePaths.push(paths[i]);
        visibleStrokes.push(strokes[i]);
      }
      return createCommittedPicture(visiblePaths, visibleStrokes, fixedWidthMode);
    },
    [fixedWidthMode, paths, scrollOffsetY, strokeBounds, strokes, viewportHeight],
  );

  return (
    <Canvas style={CANVAS_STYLE} ref={canvasRef}>
      {committedPicture ? <Picture picture={committedPicture} /> : renderedPaths}
      {isLiveStrokeActive && (
        <Path
          path={livePath}
          style={isLivePathVariableWidth ? "fill" : "stroke"}
          strokeWidth={isLivePathVariableWidth ? 0 : normalizedPenStrokeWidth}
          color={strokeColor}
          strokeCap="round"
          strokeJoin="round"
          antiAlias
        />
      )}
      {eraserCursor != null && eraserSize != null && (
        <Circle
          cx={eraserCursor.x}
          cy={eraserCursor.y}
          r={eraserSize}
          style="stroke"
          strokeWidth={1}
          color="#AAAAAA"
          antiAlias
        />
      )}
    </Canvas>
  );
});
