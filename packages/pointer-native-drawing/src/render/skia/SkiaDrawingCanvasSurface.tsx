import React, { RefObject, useEffect, useMemo, useRef } from 'react';
import {
  Canvas,
  CanvasRef,
  Circle,
  Group,
  Paragraph,
  Path,
  Picture,
  Skia,
  SkPath,
} from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

import type { ReadonlyStroke, ReadonlyStrokeBounds } from '../../model/drawingTypes';
import type { TextBoxData } from '../../textbox/textBoxTypes';
import type { ViewTransform } from '../../transform';
import { transformToMatrix3 } from '../../transform';

import { createCommittedPicture, PICTURE_CACHE_STROKE_THRESHOLD } from './skiaDrawingUtils';

const VIEWPORT_CULLING_MARGIN = 280;
const CANVAS_STYLE = { flex: 1 } as const;

type SkiaDrawingCanvasSurfaceProps = {
  paths: SkPath[];
  strokes: ReadonlyArray<ReadonlyStroke>;
  strokeBounds: ReadonlyArray<ReadonlyStrokeBounds>;
  strokeColor: string;
  normalizedPenStrokeWidth: number;
  livePathSV: SharedValue<SkPath>;
  eraserCursor?: { x: number; y: number } | null;
  eraserSize?: number;
  canvasRef: RefObject<CanvasRef | null>;
  scrollOffsetY: number;
  viewportHeight: number;
  viewportWidth: number;
  viewTransform?: ViewTransform;
  /** Committed TextBoxes to render via Skia Paragraph. */
  textBoxes?: readonly TextBoxData[];
  /** TextBox currently being edited (excluded from Skia rendering). */
  editingTextBoxId?: string | null;
};

const isStrokeVisible = (
  bounds: ReadonlyStrokeBounds,
  scrollOffsetY: number,
  viewportHeight: number,
  viewTransform?: ViewTransform,
  viewportWidth?: number
): boolean => {
  if (viewportHeight <= 0) return true;

  if (viewTransform) {
    const s = viewTransform.scale || 1;
    const visibleTop = -viewTransform.translateY / s - VIEWPORT_CULLING_MARGIN;
    const visibleBottom = (viewportHeight - viewTransform.translateY) / s + VIEWPORT_CULLING_MARGIN;
    if (bounds.maxY < visibleTop || bounds.minY > visibleBottom) return false;

    if (viewportWidth && viewportWidth > 0) {
      const visibleLeft = -viewTransform.translateX / s - VIEWPORT_CULLING_MARGIN;
      const visibleRight = (viewportWidth - viewTransform.translateX) / s + VIEWPORT_CULLING_MARGIN;
      if (bounds.maxX < visibleLeft || bounds.minX > visibleRight) return false;
    }
    return true;
  }

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
  livePathSV,
  eraserCursor,
  eraserSize,
  canvasRef,
  scrollOffsetY,
  viewportHeight,
  viewportWidth,
  viewTransform,
  textBoxes,
  editingTextBoxId,
}: SkiaDrawingCanvasSurfaceProps) {
  const matrix = useMemo(
    () => (viewTransform ? transformToMatrix3(viewTransform) : undefined),
    [viewTransform]
  );

  const renderedPaths = useMemo(() => {
    if (paths.length >= PICTURE_CACHE_STROKE_THRESHOLD) {
      return null;
    }

    return paths.map((path, index) => {
      const bounds = strokeBounds[index];
      if (
        bounds &&
        !isStrokeVisible(bounds, scrollOffsetY, viewportHeight, viewTransform, viewportWidth)
      ) {
        return null;
      }

      const stroke = strokes[index];
      return (
        <Path
          key={`path-${index}`}
          path={path}
          style='stroke'
          strokeWidth={stroke?.width ?? normalizedPenStrokeWidth}
          color={stroke?.color ?? strokeColor}
          strokeCap={stroke?.strokeCap ?? 'round'}
          strokeJoin='round'
          opacity={stroke?.opacity ?? 1}
          antiAlias
        />
      );
    });
  }, [
    normalizedPenStrokeWidth,
    paths,
    scrollOffsetY,
    strokeBounds,
    strokeColor,
    strokes,
    viewportHeight,
    viewportWidth,
    viewTransform,
  ]);

  const committedPicture = useMemo(() => {
    if (paths.length < PICTURE_CACHE_STROKE_THRESHOLD) return null;

    const visiblePaths: SkPath[] = [];
    const visibleStrokes: ReadonlyStroke[] = [];
    for (let i = 0; i < paths.length; i++) {
      const bounds = strokeBounds[i];
      if (
        bounds &&
        !isStrokeVisible(bounds, scrollOffsetY, viewportHeight, viewTransform, viewportWidth)
      ) {
        continue;
      }
      visiblePaths.push(paths[i]);
      visibleStrokes.push(strokes[i]);
    }
    return createCommittedPicture(visiblePaths, visibleStrokes);
  }, [paths, scrollOffsetY, strokeBounds, strokes, viewportHeight, viewportWidth, viewTransform]);

  // Build Skia Paragraphs for committed TextBoxes.
  // ParagraphBuilder.Make() without fontMgr uses the platform default internally.
  const prevParagraphsRef = useRef<Array<{ dispose?: () => void }>>([]);

  const textBoxParagraphs = useMemo(() => {
    if (!textBoxes || textBoxes.length === 0) return null;
    return textBoxes
      .filter((tb) => tb.id !== editingTextBoxId && tb.text.length > 0)
      .map((tb) => {
        const builder = Skia.ParagraphBuilder.Make();
        builder.pushStyle({
          color: Skia.Color(tb.color),
          fontSize: tb.fontSize,
        });
        builder.addText(tb.text);
        builder.pop();
        const para = builder.build();
        para.layout(tb.width);
        return { id: tb.id, paragraph: para, x: tb.x, y: tb.y, width: tb.width };
      });
  }, [editingTextBoxId, textBoxes]);

  // Dispose previous Skia Paragraph native objects to prevent memory leaks
  useEffect(() => {
    const prev = prevParagraphsRef.current;
    prevParagraphsRef.current = textBoxParagraphs?.map((p) => p.paragraph) ?? [];
    return () => {
      for (const p of prev) {
        (p as { dispose?: () => void }).dispose?.();
      }
    };
  }, [textBoxParagraphs]);

  const drawingContent = (
    <>
      {committedPicture ? <Picture picture={committedPicture} /> : renderedPaths}
      <Path
        path={livePathSV}
        style='stroke'
        strokeWidth={normalizedPenStrokeWidth}
        color={strokeColor}
        strokeCap='round'
        strokeJoin='round'
        antiAlias
      />
      {textBoxParagraphs?.map((item) => (
        <Paragraph
          key={item.id}
          paragraph={item.paragraph}
          x={item.x}
          y={item.y}
          width={item.width}
        />
      ))}
    </>
  );

  // Eraser cursor uses canvas coords (already transformed via screenToCanvas).
  // Render inside the Group when zoomed so it maps correctly to canvas space.
  const eraserOverlay = eraserCursor != null && eraserSize != null && (
    <Circle
      cx={eraserCursor.x}
      cy={eraserCursor.y}
      r={eraserSize}
      style='stroke'
      strokeWidth={1}
      color='#AAAAAA'
      antiAlias
    />
  );

  return (
    <Canvas style={CANVAS_STYLE} ref={canvasRef}>
      {matrix ? (
        <Group matrix={matrix}>
          {drawingContent}
          {eraserOverlay}
        </Group>
      ) : (
        <>
          {drawingContent}
          {eraserOverlay}
        </>
      )}
    </Canvas>
  );
});
