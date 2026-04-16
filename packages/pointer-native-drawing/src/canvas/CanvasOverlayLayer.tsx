import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';

import TextBoxEditingOverlay from '../textbox/TextBoxEditingOverlay';
import TextBoxSelectionOverlay from '../textbox/TextBoxSelectionOverlay';
import type { TextBoxData } from '../textbox/textBoxTypes';
import type { ViewTransform } from '../transform';

// ---------------------------------------------------------------------------
// Editing overlay (rendered inside gesture area)
// ---------------------------------------------------------------------------

type CanvasEditingOverlayProps = {
  editingTextBox: TextBoxData | null;
  onChangeText: (text: string) => void;
  onHeightChange: (height: number) => void;
  onBlur: () => void;
  style?: StyleProp<ViewStyle>;
  nativeStylusOverlay?: React.ReactNode;
};

export const CanvasEditingOverlay = React.memo(function CanvasEditingOverlay({
  editingTextBox,
  onChangeText,
  onHeightChange,
  onBlur,
  style,
  nativeStylusOverlay,
}: CanvasEditingOverlayProps) {
  return (
    <>
      {editingTextBox && (
        <View style={style ?? StyleSheet.absoluteFill} pointerEvents='box-none'>
          <TextBoxEditingOverlay
            textBox={editingTextBox}
            onChangeText={onChangeText}
            onHeightChange={onHeightChange}
            onBlur={onBlur}
          />
        </View>
      )}
      {nativeStylusOverlay}
    </>
  );
});

// ---------------------------------------------------------------------------
// Selection overlay (rendered OUTSIDE GestureDetector for RNGH priority)
// ---------------------------------------------------------------------------

type CanvasSelectionOverlayProps = {
  selectedTextBox: TextBoxData | null;
  viewTransform?: ViewTransform;
  onDelete: () => void;
  onEdit: () => void;
  onDismiss: () => void;
  onMoveStart: () => void;
  onMoveUpdate: (canvasDx: number, canvasDy: number) => void;
  onMoveEnd: () => void;
  onResizeStart: () => void;
  onResizeUpdate: (canvasDx: number, side: 'left' | 'right') => void;
  onResizeEnd: () => void;
  setIsScrollEnabled: (enabled: boolean) => void;
};

export const CanvasSelectionOverlay = React.memo(function CanvasSelectionOverlay({
  selectedTextBox,
  viewTransform,
  onDelete,
  onEdit,
  onDismiss,
  onMoveStart,
  onMoveUpdate,
  onMoveEnd,
  onResizeStart,
  onResizeUpdate,
  onResizeEnd,
  setIsScrollEnabled,
}: CanvasSelectionOverlayProps) {
  if (!selectedTextBox) return null;

  return (
    <TextBoxSelectionOverlay
      textBox={selectedTextBox}
      viewTransform={viewTransform}
      onDelete={onDelete}
      onEdit={onEdit}
      onDismiss={onDismiss}
      onMoveStart={onMoveStart}
      onMoveUpdate={onMoveUpdate}
      onMoveEnd={onMoveEnd}
      onResizeStart={onResizeStart}
      onResizeUpdate={onResizeUpdate}
      onResizeEnd={onResizeEnd}
      onDragLock={() => setIsScrollEnabled(false)}
      onDragUnlock={() => setIsScrollEnabled(true)}
    />
  );
});
