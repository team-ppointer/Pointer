# pointer-native-drawing

Draw/erase-only React Native Skia canvas module extracted from Pointer.

> This package intentionally exposes draw/erase behavior only. Undo/redo and history callbacks are not part of the public API.

## Install

```bash
pnpm add pointer-native-drawing
```

Required peer dependencies:

- `react`
- `react-native`
- `@shopify/react-native-skia`
- `react-native-gesture-handler`
- `react-native-reanimated`

## Exports

### Components & Hooks

- `DrawingCanvas` — main canvas component
- `useNativeStylusAdapter` — Apple Pencil high-frequency input adapter
- `buildSmoothPath` — centripetal Catmull-Rom path builder
- `buildVariableWidthPath` — pressure-sensitive variable-width path builder
- `DEFAULT_WRITING_FEEL_CONFIG` — default pressure/velocity writing config

### Types

- `DrawingCanvasRef`, `DrawingCanvasProps`
- `Stroke`, `Point`, `StrokeSample`, `WritingFeelConfig`
- `InputPhase`, `DrawingInputCallbacks`, `InputAdapter`
- `RendererState`, `RendererActions`

## Usage

```tsx
import React, { useRef } from "react";
import { View } from "react-native";
import { DrawingCanvas, DrawingCanvasRef } from "pointer-native-drawing";

export default function Example() {
  const canvasRef = useRef<DrawingCanvasRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <DrawingCanvas
        ref={canvasRef}
        strokeColor="#1E1E21"
        strokeWidth={2}
        eraserMode={false}
        eraserSize={22}
      />
    </View>
  );
}
```

### `DrawingCanvasRef`

- `clear()`
- `scrollTo(y, animated?)`
- `getStrokes()`
- `setStrokes(strokes)`
- `getTexts()` (returns `[]`)
- `setTexts(texts)` (no-op for compatibility)

## Development

```bash
pnpm install
pnpm build
pnpm typecheck
```
