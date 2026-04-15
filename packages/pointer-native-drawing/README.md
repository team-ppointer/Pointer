# pointer-native-drawing

React Native Skia 기반 드로잉 캔버스 모듈. Pointer에서 추출.

고정폭 스트로크 렌더링, Apple Pencil 고주파 입력(~240Hz), 줌/팬, Undo/Redo, 텍스트박스를 지원합니다.

## Install

```bash
pnpm add pointer-native-drawing
```

Peer dependencies:

- `react` >= 19.0.0
- `react-native` >= 0.81.0
- `@shopify/react-native-skia` >= 2.2.0
- `react-native-gesture-handler` >= 2.28.0
- `react-native-reanimated` >= 4.1.0

## Usage

```tsx
import React, { useRef } from "react";
import { View } from "react-native";
import { DrawingCanvas, DrawingCanvasRef } from "pointer-native-drawing";

export default function App() {
  const canvasRef = useRef<DrawingCanvasRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <DrawingCanvas
        ref={canvasRef}
        strokeColor="#1E1E21"
        strokeWidth={3}
        activeTool="pen"
        eraserSize={22}
        enableZoomPan
      />
    </View>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `strokeColor` | `string` | `"#1E1E21"` | 스트로크 색상 |
| `strokeWidth` | `number` | `3` | 스트로크 두께 (pt) |
| `backgroundColor` | `string` | — | 캔버스 배경색 |
| `activeTool` | `"pen" \| "eraser" \| "textbox"` | `"pen"` | 활성 도구 |
| `eraserSize` | `number` | — | 지우개 크기 |
| `enableZoomPan` | `boolean` | `false` | 핀치 줌/2-finger 팬 활성화 |
| `maxZoomScale` | `number` | `2.0` | 최대 줌 배율 |
| `stylusInput` | `"auto" \| "native" \| "rngh"` | — | 입력 어댑터 선택 |
| `pencilOnly` | `boolean` | — | Apple Pencil 전용 모드 |
| `minCanvasHeight` | `number` | — | 최소 캔버스 높이 |
| `writingFeelConfig` | `WritingFeelConfig` | — | 필기감 설정 |
| `onChange` | `(strokes: Stroke[]) => void` | — | 스트로크 변경 콜백 |
| `onUndoStateChange` | `(state) => void` | — | Undo/Redo 상태 콜백 |
| `onTransformChange` | `(t: ViewTransform) => void` | — | 줌/팬 변환 콜백 |
| `onScrollOffsetChange` | `(offsetY: number) => void` | — | 스크롤 오프셋 콜백 |
| `onCanvasHeightChange` | `(height: number) => void` | — | 캔버스 높이 변경 콜백 |
| `children` | `ReactNode` | — | 캔버스 위에 오버레이할 자식 요소 |

## Ref Methods (`DrawingCanvasRef`)

| Method | Description |
|--------|-------------|
| `clear()` | 캔버스 초기화 |
| `scrollTo(y, animated?)` | 스크롤 이동 |
| `getStrokes()` / `setStrokes(strokes)` | 스트로크 get/set |
| `getTextBoxes()` / `setTextBoxes(textBoxes)` | 텍스트박스 get/set |
| `getTransform()` / `setTransform(t)` | 줌/팬 변환 get/set |
| `resetZoom()` | 줌 초기화 |
| `undo()` / `redo()` | 실행 취소 / 다시 실행 |

## Exports

### Components & Hooks

- `DrawingCanvas` — 메인 캔버스 컴포넌트
- `useNativeStylusAdapter` — Apple Pencil 고주파 입력 어댑터

### Path Builders

- `buildSmoothPath` — centripetal Catmull-Rom path builder
- `buildCenterlinePath` — resample + smooth + Catmull-Rom centerline path builder
- `hasNativePathBuilder` — native C++ JSI path builder 사용 가능 여부
- `nativeBuildSmoothPath` / `nativeBuildCenterlinePath` — native C++ (SkPathBuilder) 구현

### Utilities

- `DEFAULT_WRITING_FEEL_CONFIG` — 기본 필기감 설정
- `OneEuroFilter2D` / `DEFAULT_ONE_EURO_CONFIG` — 1€ noise filter (RNGH 60Hz 입력용)
- `IDENTITY_TRANSFORM` / `screenToCanvas` / `canvasToScreen` — 좌표 변환 유틸

### Types

- `DrawingCanvasRef`, `DrawingCanvasProps`, `ActiveTool`
- `Stroke`, `Point`, `StrokeSample`, `WritingFeelConfig`, `InputEvent`, `PointerType`
- `ReadonlyPoint`, `ReadonlyStroke`, `ReadonlyStrokeSample`, `ReadonlyDrawingDocument`, `ReadonlyActiveStrokeSession`, `ReadonlyStrokeBounds`
- `InputPhase`, `CancelReason`, `DrawingInputCallbacks`
- `InputAdapter`, `InputAdapterConfig`, `InputAdapterState`, `InputOverlayAdapter`
- `NativeStylusAdapterConfig`, `OneEuroFilterConfig`, `PathBuildState`
- `ViewTransform`, `RendererViewport`, `CommittedStrokeDiff`, `RendererState`, `RendererActions`
- `SkiaRendererState`, `SkiaRendererActions`
- `CanvasObject`, `StrokeObject`, `TextBoxObject`, `CanvasDocument`, `ReadonlyCanvasObject`, `ReadonlyCanvasDocument`
- `DocumentSnapshot`, `HistoryEntry`, `HistoryStateListener` 및 개별 entry 타입들
- `TextBoxData`, `TextBoxState`

## Architecture

```
Input (RNGH 60Hz / Native Stylus 240Hz)
  → DrawingEngine (stroke model + session)
  → buildCenterlinePath (native C++ JSI or TS fallback)
    → resample → smooth → Catmull-Rom spline
  → Skia <Path style="stroke" />
```

- **Input Adapters** — RNGH (finger/pen, 1€ filter) + Native Stylus (Apple Pencil, predicted touches)
- **DrawingEngine** — 스트로크 모델, 세션 관리, HistoryManager (undo/redo)
- **Renderer** — `buildCenterlinePath` 고정폭 centerline, DPI-aware spacing (`3.0 / PixelRatio`)
- **Native Path Builder** — iOS C++ SkPathBuilder JSI 바인딩, TS fallback 자동 전환

## Development

```bash
pnpm install
pnpm build
pnpm typecheck
```

### Example App

```bash
cd example && npm install && cd ios && bundle exec pod install
cd .. && npx react-native run-ios
```

라이브러리 소스 변경 후: `pnpm build` (루트) → `cd example && npm install` → Metro restart

## License

MIT
