import { useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent, type ViewProps, useWindowDimensions } from 'react-native';

interface ContentInsetProps extends ViewProps {
  className?: string;
  children: ReactNode;
}

const MIN_HORIZONTAL_PADDING = 16;
const MAX_HORIZONTAL_PADDING = 128;
const START_ANCHOR_WIDTH = 768;
const START_ANCHOR_PADDING = 60;
const END_ANCHOR_WIDTH = 1024;
const END_ANCHOR_PADDING = 128;

const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const interpolateValue = (
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
) => {
  const ratio = (value - inputMin) / (inputMax - inputMin);
  return outputMin + (outputMax - outputMin) * ratio;
};

const getResponsiveHorizontalPadding = (width: number) => {
  const interpolatedPadding = interpolateValue(
    width,
    START_ANCHOR_WIDTH,
    END_ANCHOR_WIDTH,
    START_ANCHOR_PADDING,
    END_ANCHOR_PADDING
  );

  return clampValue(interpolatedPadding, MIN_HORIZONTAL_PADDING, MAX_HORIZONTAL_PADDING);
};

const ContentInset = ({ className, children, style, onLayout, ...props }: ContentInsetProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);
  const targetWidth = layoutWidth ?? windowWidth;
  const paddingHorizontal = getResponsiveHorizontalPadding(targetWidth);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);

    setLayoutWidth((prevWidth) => (prevWidth === nextWidth ? prevWidth : nextWidth));
    onLayout?.(event);
  };

  return (
    <View
      className={`w-full ${className ?? ''}`}
      style={[{ paddingHorizontal }, style]}
      onLayout={handleLayout}
      {...props}>
      {children}
    </View>
  );
};

export default ContentInset;
