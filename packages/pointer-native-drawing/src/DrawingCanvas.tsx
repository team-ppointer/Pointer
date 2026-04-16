import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import type {
  Stroke,
  WritingFeelConfig,
} from "./model/drawingTypes";
import { DEFAULT_WRITING_FEEL_CONFIG } from "./model/writingFeel";
import { useRnghPanAdapter } from "./input/rnghPanAdapter";
import { useNativeStylusAdapter } from "./input/nativeStylusAdapter";
import type { TextBoxData } from "./textbox/textBoxTypes";
import { useTextBoxManager } from "./textbox/useTextBoxManager";
import { SkiaDrawingCanvasSurface } from "./render/skia/SkiaDrawingCanvasSurface";
import { CanvasEditingOverlay, CanvasSelectionOverlay } from "./canvas/CanvasOverlayLayer";
import { useSkiaDrawingRenderer } from "./render/skia/useSkiaDrawingRenderer";
import type { ViewTransform } from "./transform";
import { IDENTITY_TRANSFORM } from "./transform";
import { useDrawingDocumentController } from "./canvas/useDrawingDocumentController";
import type { DocumentTextBoxActions } from "./canvas/useDrawingDocumentController";
import { useCanvasViewportController } from "./canvas/useCanvasViewportController";
import { useCanvasGestureComposer } from "./canvas/useCanvasGestureComposer";
import { useDrawingInteractionController } from "./canvas/useDrawingInteractionController";

export type DrawingCanvasRef = {
  clear: () => void;
  scrollTo: (y: number, animated?: boolean) => void;
  getStrokes: () => Stroke[];
  setStrokes: (strokes: Stroke[]) => void;
  getTextBoxes: () => TextBoxData[];
  setTextBoxes: (textBoxes: TextBoxData[]) => void;
  getTransform: () => ViewTransform;
  setTransform: (t: ViewTransform) => void;
  resetZoom: () => void;
  undo: () => void;
  redo: () => void;
};

export type ActiveTool = "pen" | "eraser" | "textbox";

export type DrawingCanvasProps = {
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  onChange?: (strokes: Stroke[]) => void;
  /** Fired on any document mutation (strokes or textboxes). Use for dirty-tracking. */
  onDirty?: () => void;
  onUndoStateChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
  onScrollOffsetChange?: (offsetY: number) => void;
  onCanvasHeightChange?: (height: number) => void;
  /** @deprecated Use `activeTool="eraser"` instead. */
  eraserMode?: boolean;
  activeTool?: ActiveTool;
  eraserSize?: number;
  minCanvasHeight?: number;
  writingFeelConfig?: WritingFeelConfig;
  stylusInput?: "auto" | "native" | "rngh";
  pencilOnly?: boolean;
  children?: React.ReactNode;
  enableZoomPan?: boolean;
  maxZoomScale?: number;
  onTransformChange?: (t: ViewTransform) => void;
};

const PAN_MIN_DISTANCE = 0.12;
const DEFAULT_MAX_ZOOM_SCALE = 2.0;

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    {
      strokeColor = "#1E1E21",
      strokeWidth = 3,
      backgroundColor = "#fff",
      onChange,
      onDirty,
      onUndoStateChange,
      onScrollOffsetChange,
      onCanvasHeightChange,
      eraserMode: eraserModeProp = false,
      activeTool: activeToolProp,
      eraserSize = 20,
      minCanvasHeight = 800,
      writingFeelConfig = DEFAULT_WRITING_FEEL_CONFIG,
      stylusInput = "auto",
      pencilOnly = false,
      children,
      enableZoomPan = false,
      maxZoomScale = DEFAULT_MAX_ZOOM_SCALE,
      onTransformChange,
    },
    ref,
  ) => {
    // Derive activeTool: explicit prop wins, then legacy eraserMode mapping
    const activeTool: ActiveTool = activeToolProp ?? (eraserModeProp ? "eraser" : "pen");
    const eraserMode = activeTool === "eraser";

    const [isScrollEnabled, setIsScrollEnabled] = useState(true);

    // Shared maxY ref between document and viewport controllers
    const maxYRef = useRef<number>(0);

    // --- Renderer ---
    const [rendererState, rendererActions] = useSkiaDrawingRenderer(writingFeelConfig);
    const { paths, strokes, livePath, isLiveStrokeActive, viewport, canvasRef } = rendererState;
    const { updateViewport } = rendererActions;

    // --- Viewport Controller ---
    const vc = useCanvasViewportController({
      minCanvasHeight,
      enableZoomPan,
      maxZoomScale,
      maxYRef,
      onCanvasHeightChange,
      onScrollOffsetChange,
      onTransformChange,
      updateViewport,
    });

    // --- Document Controller ---
    const textBoxActionsRef = useRef<DocumentTextBoxActions | null>(null);

    const docController = useDrawingDocumentController({
      strokeWidth,
      strokeColor,
      eraserSize,
      onChange,
      onDirty,
      onUndoStateChange,
      rendererActions,
      textBoxActionsRef,
      maxYRef,
      maybeGrowCanvasHeight: vc.maybeGrowCanvasHeight,
      syncCanvasHeightFromMaxY: vc.syncCanvasHeightFromMaxY,
    });

    // --- TextBox Manager ---
    const [textBoxState, textBoxActions] = useTextBoxManager(docController.historyRef, { width: vc.viewportSize.width, height: vc.effectiveCanvasHeight }, onDirty);
    textBoxActionsRef.current = textBoxActions;

    // End textbox session when switching away from textbox tool
    const prevToolRef = useRef(activeTool);
    useEffect(() => {
      if (prevToolRef.current === "textbox" && activeTool !== "textbox") {
        textBoxActions.endSession();
      }
      prevToolRef.current = activeTool;
    }, [activeTool, textBoxActions]);

    // --- Imperative Ref ---
    useImperativeHandle(
      ref,
      () => ({
        clear: docController.clear,
        scrollTo: (y: number, animated = true) => {
          if (enableZoomPan) {
            vc.applyTransform({
              ...vc.viewTransformRef.current,
              translateY: -y * vc.viewTransformRef.current.scale,
            });
            return;
          }
          vc.scrollViewRef.current?.scrollTo({ y: Math.max(0, y), animated });
        },
        getStrokes: docController.getStrokes,
        setStrokes: docController.setStrokes,
        getTextBoxes: () => [...textBoxState.textBoxes],
        setTextBoxes: (tbs: TextBoxData[]) => {
          textBoxActions.setTextBoxes(tbs);
          docController.historyRef.current.clear();
        },
        getTransform: () => vc.viewTransformRef.current,
        setTransform: (t: ViewTransform) => vc.applyTransform(t),
        resetZoom: () => vc.applyTransform(IDENTITY_TRANSFORM),
        undo: docController.undo,
        redo: docController.redo,
      }),
      [
        docController.clear,
        docController.getStrokes,
        docController.setStrokes,
        docController.undo,
        docController.redo,
        docController.historyRef,
        vc.applyTransform,
        vc.viewTransformRef,
        vc.scrollViewRef,
        enableZoomPan,
        textBoxState.textBoxes,
        textBoxActions,
      ],
    );

    // --- Interaction Controller ---
    const { transformedCallbacks } = useDrawingInteractionController({
      eraserMode,
      enableZoomPan,
      canvasWidth: vc.viewportSize.width,
      historyRef: docController.historyRef,
      viewTransformRef: vc.viewTransformRef,
      drawingActions: docController,
      setIsScrollEnabled,
    });

    const isFabric = !!(globalThis as any).nativeFabricUIManager;
    const useNativeStylus =
      isFabric &&
      (stylusInput === "native" ||
        (stylusInput === "auto" && Platform.OS === "ios"));

    const nativeStylusAdapter = useNativeStylusAdapter({
      callbacks: transformedCallbacks,
      eraserMode,
    });

    const { gesture: drawPan } = useRnghPanAdapter({
      eraserMode,
      pencilOnly,
      minDistance: PAN_MIN_DISTANCE,
      callbacks: transformedCallbacks,
    });

    // --- Gesture Composer ---
    const { composedGesture } = useCanvasGestureComposer({
      enableZoomPan,
      maxZoomScale,
      isTextBoxTool: activeTool === "textbox",
      viewTransformRef: vc.viewTransformRef,
      applyTransform: vc.applyTransform,
      drawPanGesture: drawPan,
      onTextBoxTap: textBoxActions.handleTap,
    });

    useEffect(() => {
      const normalizedMinHeight = Math.max(400, minCanvasHeight);
      vc.minimumCanvasHeightRef.current = normalizedMinHeight;

      if (vc.canvasHeight < normalizedMinHeight) {
        vc.setCanvasHeightValue(normalizedMinHeight);
        return;
      }

      vc.onCanvasHeightChangeRef.current?.(vc.canvasHeight);
    }, [
      vc.canvasHeight,
      minCanvasHeight,
      vc,
    ]);

    // --- Render: Zoom/Pan mode ---
    if (enableZoomPan) {
      const childTransformStyle = {
        transform: [
          { translateX: vc.viewTransform.translateX },
          { translateY: vc.viewTransform.translateY },
          { scale: vc.viewTransform.scale },
        ],
      } as const;

      return (
        <View style={[styles.container, { backgroundColor }]} onLayout={vc.handleZoomLayout}>
          <GestureDetector gesture={composedGesture}>
            <View style={styles.zoomWrapper}>
              <View
                style={[
                  styles.childrenWrapper,
                  vc.zoomContentSizeStyle,
                  childTransformStyle,
                ]}
              >
                {children}
              </View>
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <SkiaDrawingCanvasSurface
                  paths={paths}
                  strokes={strokes}
                  strokeBounds={rendererState.strokeBounds}
                  strokeColor={strokeColor}
                  normalizedPenStrokeWidth={docController.normalizedPenStrokeWidth}
                  livePath={livePath}
                  isLiveStrokeActive={isLiveStrokeActive}
                  eraserCursor={docController.eraserCursor}
                  eraserSize={eraserSize}
                  canvasRef={canvasRef}
                  scrollOffsetY={0}
                  viewportHeight={vc.viewportSize.height}
                  viewportWidth={vc.viewportSize.width}
                  viewTransform={vc.viewTransform}
                  textBoxes={textBoxState.textBoxes}
                  editingTextBoxId={textBoxState.editingId}
                />
              </View>
              <CanvasEditingOverlay
                editingTextBox={textBoxState.editingTextBox}
                onChangeText={textBoxActions.updateEditingText}
                onHeightChange={textBoxActions.updateEditingHeight}
                onBlur={textBoxActions.commitEditing}
                style={[StyleSheet.absoluteFill, styles.childrenWrapper, vc.zoomContentSizeStyle, childTransformStyle]}
                nativeStylusOverlay={useNativeStylus ? nativeStylusAdapter?.overlay : undefined}
              />
            </View>
          </GestureDetector>
          <CanvasSelectionOverlay
            selectedTextBox={textBoxState.selectedTextBox}
            viewTransform={vc.viewTransform}
            onDelete={textBoxActions.deleteSelected}
            onEdit={textBoxActions.editSelected}
            onDismiss={textBoxActions.deselect}
            onMoveStart={textBoxActions.beginMove}
            onMoveUpdate={textBoxActions.updateMove}
            onMoveEnd={textBoxActions.endMove}
            onResizeStart={textBoxActions.beginResize}
            onResizeUpdate={textBoxActions.updateResize}
            onResizeEnd={textBoxActions.endResize}
            setIsScrollEnabled={setIsScrollEnabled}
          />
        </View>
      );
    }

    // --- Render: Scroll mode (default) ---
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView
          ref={vc.scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={isScrollEnabled}
          showsVerticalScrollIndicator
          indicatorStyle="black"
          onScroll={vc.handleScroll}
          onLayout={vc.handleLayout}
          scrollEventThrottle={16}
          nestedScrollEnabled
        >
          <GestureDetector gesture={composedGesture}>
            <View style={[styles.canvasWrapper, { height: vc.canvasHeight }]}>
              {children}
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <SkiaDrawingCanvasSurface
                  paths={paths}
                  strokes={strokes}
                  strokeBounds={rendererState.strokeBounds}
                  strokeColor={strokeColor}
                  normalizedPenStrokeWidth={docController.normalizedPenStrokeWidth}
                  livePath={livePath}
                  isLiveStrokeActive={isLiveStrokeActive}
                  eraserCursor={docController.eraserCursor}
                  eraserSize={eraserSize}
                  canvasRef={canvasRef}
                  scrollOffsetY={viewport.scrollOffsetY}
                  viewportHeight={viewport.viewportHeight}
                  viewportWidth={vc.viewportSize.width}
                  textBoxes={textBoxState.textBoxes}
                  editingTextBoxId={textBoxState.editingId}
                />
              </View>
              <CanvasEditingOverlay
                editingTextBox={textBoxState.editingTextBox}
                onChangeText={textBoxActions.updateEditingText}
                onHeightChange={textBoxActions.updateEditingHeight}
                onBlur={textBoxActions.commitEditing}
                nativeStylusOverlay={useNativeStylus ? nativeStylusAdapter?.overlay : undefined}
              />
            </View>
          </GestureDetector>
        </ScrollView>
        <CanvasSelectionOverlay
          selectedTextBox={textBoxState.selectedTextBox}
          onDelete={textBoxActions.deleteSelected}
          onEdit={textBoxActions.editSelected}
          onDismiss={textBoxActions.deselect}
          onMoveStart={textBoxActions.beginMove}
          onMoveUpdate={textBoxActions.updateMove}
          onMoveEnd={textBoxActions.endMove}
          onResizeStart={textBoxActions.beginResize}
          onResizeUpdate={textBoxActions.updateResize}
          onResizeEnd={textBoxActions.endResize}
          setIsScrollEnabled={setIsScrollEnabled}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  canvasWrapper: {
    width: "100%",
  },
  zoomWrapper: {
    flex: 1,
    overflow: "hidden",
  },
  childrenWrapper: {
    transformOrigin: "left top",
  },
});

export default React.memo(DrawingCanvas);
