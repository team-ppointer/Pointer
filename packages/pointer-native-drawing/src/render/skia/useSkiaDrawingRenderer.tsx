import React, { useMemo } from 'react';
import { Path, type SkPath } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { type Stroke } from '../../model/drawingTypes';

type UseSkiaDrawingRendererParams = {
  paths: SkPath[];
  strokes: Stroke[];
  strokeWidth: number;
  strokeColor: string;
  showHover: SharedValue<boolean>;
};

export function useSkiaDrawingRenderer({
  paths,
  strokes,
  strokeWidth,
  strokeColor,
  showHover,
}: UseSkiaDrawingRendererParams) {
  const hoverOpacity = useDerivedValue(() => {
    return showHover.value ? 0.6 : 0;
  }, [showHover]);

  const renderedPaths = useMemo(
    () =>
      paths.map((p, i) => {
        const stroke = strokes[i];
        return (
          <Path
            key={`path-${i}`}
            path={p}
            style='stroke'
            strokeWidth={stroke?.width ?? strokeWidth}
            color={stroke?.color ?? strokeColor}
            strokeCap='round'
            strokeJoin='round'
          />
        );
      }),
    [paths, strokes, strokeWidth, strokeColor]
  );

  return { renderedPaths, hoverOpacity };
}
