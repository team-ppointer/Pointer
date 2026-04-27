import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';

type SkiaDrawingCanvasSurfaceProps = {
  height: number;
  children: React.ReactNode;
};

export function SkiaDrawingCanvasSurface({ height, children }: SkiaDrawingCanvasSurfaceProps) {
  return <Canvas style={[styles.canvas, { height }]}>{children}</Canvas>;
}

const styles = StyleSheet.create({
  canvas: { width: '100%', backgroundColor: 'transparent' },
});
