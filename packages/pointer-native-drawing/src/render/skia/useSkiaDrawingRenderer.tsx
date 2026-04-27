import React, { useMemo } from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { Path, Text, type SkFont, type SkPath } from '@shopify/react-native-skia';

import { type Stroke, type TextItem } from '../../model/drawingTypes';
import { wrapTextToLines } from './skiaRenderUtils';

type UseSkiaDrawingRendererParams = {
  paths: SkPath[];
  strokes: Stroke[];
  strokeWidth: number;
  strokeColor: string;
  texts: TextItem[];
  font: SkFont | null;
  maxTextWidth: number;
  activeTextInputId: string | null;
  showHover: SharedValue<boolean>;
};

export function useSkiaDrawingRenderer({
  paths,
  strokes,
  strokeWidth,
  strokeColor,
  texts,
  font,
  maxTextWidth,
  activeTextInputId,
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
            style="stroke"
            strokeWidth={stroke?.width ?? strokeWidth}
            color={stroke?.color ?? strokeColor}
            strokeCap="round"
            strokeJoin="round"
          />
        );
      }),
    [paths, strokes, strokeWidth, strokeColor]
  );

  const renderedTexts = useMemo(
    () =>
      font
        ? texts
            .filter((textItem) => textItem.id !== activeTextInputId)
            .flatMap((textItem) => {
              const lines = wrapTextToLines(textItem.text, maxTextWidth, (t) =>
                font.measureText(t)
              );

              return lines.map((line, lineIndex) => (
                <Text
                  key={`${textItem.id}-line-${lineIndex}`}
                  x={textItem.x}
                  y={textItem.y + 15 + lineIndex * 22.5}
                  text={line}
                  font={font}
                  color={textItem.color}
                />
              ));
            })
        : null,
    [texts, font, maxTextWidth, activeTextInputId]
  );

  return { renderedPaths, renderedTexts, hoverOpacity };
}
