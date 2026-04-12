import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import type { TextBoxData } from "./textBoxTypes";
import type { ViewTransform } from "../transform";
import { canvasToScreen } from "../transform";

type Props = {
  textBox: TextBoxData;
  viewTransform?: ViewTransform;
  onDelete: () => void;
  onDismiss: () => void;
  onEdit: () => void;
  onMoveStart: () => void;
  onMoveUpdate: (canvasDx: number, canvasDy: number) => void;
  onMoveEnd: () => void;
  onResizeStart: () => void;
  onResizeUpdate: (canvasDx: number, side: "left" | "right") => void;
  onResizeEnd: () => void;
  /** Lock outer scroll/zoom during drag. */
  onDragLock?: () => void;
  /** Unlock outer scroll/zoom after drag. */
  onDragUnlock?: () => void;
};

const HANDLE_SIZE = 20;
const HANDLE_HIT_SLOP = 10;

// ---------------------------------------------------------------------------
// All-RNGH selection overlay.
//
// Rendered as a SIBLING of the main GestureDetector (not inside it) so that
// RNGH hit-testing gives the overlay's gestures priority over the drawing
// gestures via z-order.  Each interactive region has its own GestureDetector.
//
// Coordinate rule:
//   - textBox data is in canvas coordinates
//   - rendering uses canvas→screen conversion
//   - gesture deltas are screen pixels → divide by scale for canvas deltas
// ---------------------------------------------------------------------------

function TextBoxSelectionOverlay(props: Props) {
  const { textBox, viewTransform } = props;
  const scale = viewTransform?.scale ?? 1;

  // --- Ref pattern: always read latest props/scale in gesture handlers ---
  const propsRef = useRef(props);
  propsRef.current = props;

  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  // --- Canvas → screen conversion ---
  let screenX = textBox.x;
  let screenY = textBox.y;
  if (viewTransform) {
    const screen = canvasToScreen(textBox.x, textBox.y, viewTransform);
    screenX = screen.x;
    screenY = screen.y;
  }

  const scaledWidth = textBox.width * scale;
  const effectiveHeight = Math.max(textBox.height, textBox.fontSize * 1.5);
  const scaledHeight = effectiveHeight * scale;

  // =======================================================================
  // JS handlers called via runOnJS (read refs, never stale)
  // =======================================================================

  const handleDismiss = useCallback(() => {
    propsRef.current.onDismiss();
  }, []);

  const handleDelete = useCallback(() => {
    propsRef.current.onDelete();
  }, []);

  const handleMoveStart = useCallback(() => {
    propsRef.current.onDragLock?.();
    propsRef.current.onMoveStart();
  }, []);

  const handleMoveUpdate = useCallback(
    (translationX: number, translationY: number) => {
      const s = scaleRef.current;
      propsRef.current.onMoveUpdate(translationX / s, translationY / s);
    },
    [],
  );

  const handleMoveEnd = useCallback(() => {
    propsRef.current.onMoveEnd();
    propsRef.current.onDragUnlock?.();
  }, []);

  const handleResizeStart = useCallback(() => {
    propsRef.current.onDragLock?.();
    propsRef.current.onResizeStart();
  }, []);

  const handleResizeLeftUpdate = useCallback((translationX: number) => {
    const s = scaleRef.current;
    propsRef.current.onResizeUpdate(translationX / s, "left");
  }, []);

  const handleResizeRightUpdate = useCallback((translationX: number) => {
    const s = scaleRef.current;
    propsRef.current.onResizeUpdate(translationX / s, "right");
  }, []);

  const handleResizeEnd = useCallback(() => {
    propsRef.current.onResizeEnd();
    propsRef.current.onDragUnlock?.();
  }, []);

  const handleEdit = useCallback(() => {
    propsRef.current.onEdit();
  }, []);

  // =======================================================================
  // RNGH Gestures
  // =======================================================================

  // Backdrop: tap on empty area → dismiss selection
  const dismissGesture = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        "worklet";
        runOnJS(handleDismiss)();
      }),
    [handleDismiss],
  );

  // Delete button: tap
  const deleteGesture = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        "worklet";
        runOnJS(handleDelete)();
      }),
    [handleDelete],
  );

  // Body tap: tap on body → enter editing
  const bodyTapGesture = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        "worklet";
        runOnJS(handleEdit)();
      }),
    [handleEdit],
  );

  // Move: pan on body area
  const movePanGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(1)
        .onStart(() => {
          "worklet";
          runOnJS(handleMoveStart)();
        })
        .onUpdate((e) => {
          "worklet";
          runOnJS(handleMoveUpdate)(e.translationX, e.translationY);
        })
        .onFinalize(() => {
          "worklet";
          runOnJS(handleMoveEnd)();
        }),
    [handleMoveStart, handleMoveUpdate, handleMoveEnd],
  );

  // Body gesture: tap (edit) races with pan (move)
  const bodyGesture = useMemo(
    () => Gesture.Race(bodyTapGesture, movePanGesture),
    [bodyTapGesture, movePanGesture],
  );

  // Resize left handle: pan
  const resizeLeftGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(1)
        .onStart(() => {
          "worklet";
          runOnJS(handleResizeStart)();
        })
        .onUpdate((e) => {
          "worklet";
          runOnJS(handleResizeLeftUpdate)(e.translationX);
        })
        .onFinalize(() => {
          "worklet";
          runOnJS(handleResizeEnd)();
        }),
    [handleResizeStart, handleResizeLeftUpdate, handleResizeEnd],
  );

  // Resize right handle: pan
  const resizeRightGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(1)
        .onStart(() => {
          "worklet";
          runOnJS(handleResizeStart)();
        })
        .onUpdate((e) => {
          "worklet";
          runOnJS(handleResizeRightUpdate)(e.translationX);
        })
        .onFinalize(() => {
          "worklet";
          runOnJS(handleResizeEnd)();
        }),
    [handleResizeStart, handleResizeRightUpdate, handleResizeEnd],
  );

  // =======================================================================
  // Render
  //
  // Z-order (bottom → top):
  //   backdrop → body (move) → resize handles → toolbar (delete)
  //
  // RNGH hit-tests topmost view first, so handles win over body,
  // body wins over backdrop, and toolbar wins over everything beneath it.
  // =======================================================================

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dismiss backdrop — lowest z-order, catches taps on empty area */}
      <GestureDetector gesture={dismissGesture}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>

      {/* Move area (TextBox body) — tap to edit, drag to move */}
      <GestureDetector gesture={bodyGesture}>
        <View
          style={[
            styles.moveArea,
            {
              left: screenX,
              top: screenY,
              width: scaledWidth,
              height: scaledHeight,
            },
          ]}
        />
      </GestureDetector>

      {/* Left resize handle */}
      <GestureDetector gesture={resizeLeftGesture}>
        <View
          style={[
            styles.resizeHandle,
            {
              left: screenX - HANDLE_SIZE / 2,
              top: screenY + scaledHeight / 2 - HANDLE_SIZE / 2,
            },
          ]}
          hitSlop={HANDLE_HIT_SLOP}
        />
      </GestureDetector>

      {/* Right resize handle */}
      <GestureDetector gesture={resizeRightGesture}>
        <View
          style={[
            styles.resizeHandle,
            {
              left: screenX + scaledWidth - HANDLE_SIZE / 2,
              top: screenY + scaledHeight / 2 - HANDLE_SIZE / 2,
            },
          ]}
          hitSlop={HANDLE_HIT_SLOP}
        />
      </GestureDetector>

      {/* Delete toolbar */}
      <GestureDetector gesture={deleteGesture}>
        <View
          style={[
            styles.toolbar,
            {
              left: screenX + scaledWidth / 2 - 30,
              top: screenY - 40,
            },
          ]}
        >
          <Text style={styles.deleteText}>삭제</Text>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  moveArea: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 2,
  },
  resizeHandle: {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  toolbar: {
    position: "absolute",
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "600",
  },
});

export default React.memo(TextBoxSelectionOverlay);
