import React, { forwardRef } from 'react';
import { View, TextInput, Pressable, Text as RNText, StyleSheet } from 'react-native';

import { type TextItem } from '../model/drawingTypes';
import { type ActiveTextInput, TEXT_FONT_SIZE, TEXT_LINE_HEIGHT, TEXT_COLOR } from './textBoxTypes';

type TextBoxEditingOverlayProps = {
  activeTextInput: ActiveTextInput;
  maxTextWidth: number;
  containerWidth: number;
  containerHeight: number;
  onChangeText: (text: string) => void;
  onBlur: () => void;
};

export const TextBoxEditingOverlay = forwardRef<TextInput, TextBoxEditingOverlayProps>(
  ({ activeTextInput, maxTextWidth, containerWidth, containerHeight, onChangeText, onBlur }, ref) => (
    <View
      style={[
        styles.textInputWrapper,
        {
          left: Math.max(0, Math.min(activeTextInput.x, containerWidth - 200)),
          top: Math.max(16, Math.min(activeTextInput.y, containerHeight - 16 - TEXT_FONT_SIZE)),
          width: maxTextWidth,
        },
      ]}>
      <TextInput
        ref={ref}
        style={[
          styles.inlineTextInput,
          {
            fontSize: TEXT_FONT_SIZE,
            color: TEXT_COLOR,
            width: maxTextWidth,
            maxWidth: maxTextWidth,
            fontFamily: 'Pretendard',
            fontWeight: '400',
            lineHeight: TEXT_LINE_HEIGHT,
          },
        ]}
        value={activeTextInput.value}
        onChangeText={onChangeText}
        placeholder="텍스트 입력"
        placeholderTextColor="#9CA3AF"
        multiline
        autoFocus
        onBlur={onBlur}
        blurOnSubmit={false}
        scrollEnabled={false}
        textBreakStrategy="simple"
      />
    </View>
  )
);

TextBoxEditingOverlay.displayName = 'TextBoxEditingOverlay';

type TextDeleteButtonsProps = {
  texts: TextItem[];
  textMode: boolean;
  eraserMode: boolean;
  activeTextInputId: string | null;
  onDelete: (id: string) => void;
};

export function TextDeleteButtons({
  texts,
  textMode,
  eraserMode,
  activeTextInputId,
  onDelete,
}: TextDeleteButtonsProps) {
  if (!textMode || eraserMode) return null;

  return (
    <>
      {texts
        .filter((t) => t.id !== activeTextInputId)
        .map((textItem) => {
          const buttonSize = 20;
          const buttonX = textItem.x - buttonSize + 10;
          const buttonY = textItem.y + (TEXT_FONT_SIZE - buttonSize) / 2 + 10;

          return (
            <Pressable
              key={`delete-${textItem.id}`}
              style={[
                styles.deleteButton,
                {
                  position: 'absolute',
                  left: buttonX,
                  top: buttonY,
                  width: buttonSize,
                  height: buttonSize,
                  zIndex: 100,
                },
              ]}
              onPress={() => onDelete(textItem.id)}>
              <RNText style={styles.deleteButtonText}>×</RNText>
            </Pressable>
          );
        })}
    </>
  );
}

const styles = StyleSheet.create({
  textInputWrapper: {
    position: 'absolute',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  inlineTextInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    textAlignVertical: 'top',
    flexWrap: 'wrap',
  },
  deleteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});
