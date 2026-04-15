import React, { useEffect, useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import type { TextBoxData } from "./textBoxTypes";

type Props = {
  textBox: TextBoxData;
  onChangeText: (text: string) => void;
  onHeightChange: (height: number) => void;
  onBlur: () => void;
};

/**
 * RN TextInput overlay for an actively-editing TextBox.
 * Positioned at the TextBox's canvas coordinates (parent applies zoom transform).
 */
function TextBoxEditingOverlay({
  textBox,
  onChangeText,
  onHeightChange,
  onBlur,
}: Props) {
  const inputRef = useRef<TextInput>(null);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          left: textBox.x,
          top: textBox.y,
          width: textBox.width,
        },
      ]}
    >
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            fontSize: textBox.fontSize,
            color: textBox.color,
          },
        ]}
        value={textBox.text}
        onChangeText={onChangeText}
        onContentSizeChange={(e) => {
          onHeightChange(e.nativeEvent.contentSize.height);
        }}
        onBlur={onBlur}
        multiline
        autoFocus
        scrollEnabled={false}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  input: {
    padding: 0,
    margin: 0,
    textAlignVertical: "top",
  },
});

export default React.memo(TextBoxEditingOverlay);
