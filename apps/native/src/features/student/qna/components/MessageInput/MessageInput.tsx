import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Platform, Alert } from 'react-native';
import { Camera, ImageIcon, Paperclip, ArrowUp, X, Pencil } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';

import type { Message } from '../../types';

import ReplyPreview from './ReplyPreview';

import { TrackedAnimatedPressable, type ButtonId } from '@/features/student/analytics';

export interface SelectedImage {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
  fileName?: string;
}

export interface SelectedFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

interface MessageInputProps {
  replyTo?: Message | null;
  editingMessage?: Message | null;
  senderName?: string;
  onClearReply?: () => void;
  onCancelEdit?: () => void;
  onSend: (text: string, replyTo?: Message) => void;
  onImageSelected?: (image: SelectedImage) => void;
  onFileSelected?: (file: SelectedFile) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 전체 화면 모드(바텀 내비게이션이 없는 경우)에서 하단 safe area 적용 */
  useSafeAreaBottom?: boolean;
}

const IconButton = ({
  onPress,
  icon: Icon,
  disabled,
  buttonId,
}: {
  onPress?: () => void;
  icon: typeof Camera;
  disabled?: boolean;
  buttonId?: ButtonId;
}) => {
  if (buttonId) {
    return (
      <TrackedAnimatedPressable
        buttonId={buttonId}
        onPress={onPress}
        disabled={disabled}
        className={`h-[36px] w-[36px] items-center justify-center rounded-full ${
          disabled ? 'opacity-50' : ''
        }`}>
        <Icon size={22} color={colors['gray-600']} />
      </TrackedAnimatedPressable>
    );
  }
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      className={`h-[36px] w-[36px] items-center justify-center rounded-full ${
        disabled ? 'opacity-50' : ''
      }`}>
      <Icon size={22} color={colors['gray-600']} />
    </AnimatedPressable>
  );
};

const MessageInput = ({
  replyTo,
  editingMessage,
  senderName,
  onClearReply,
  onCancelEdit,
  onSend,
  onImageSelected,
  onFileSelected,
  placeholder = '무엇이든 물어보세요.',
  disabled,
  useSafeAreaBottom = false,
}: MessageInputProps) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const insets = useSafeAreaInsets();

  // 전체 화면 모드에서 하단 safe area 적용
  const bottomMargin = useSafeAreaBottom ? Math.max(insets.bottom, 10) : 10;

  // When editing message changes, populate the text field
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
    }
  }, [editingMessage]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim(), replyTo ?? undefined);
    setText('');
    onClearReply?.();
    onCancelEdit?.();
  };

  const handleCancelEdit = () => {
    setText('');
    onCancelEdit?.();
  };

  const canSend = text.trim().length > 0 && !disabled;
  const isEditing = !!editingMessage;

  // Show typing mode when focused, has text, or editing
  const isTypingMode = isFocused || text.length > 0 || isEditing;

  // Camera: Take a photo
  const handleCamera = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라를 사용하려면 권한이 필요합니다.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImageSelected?.({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.mimeType,
          fileName: asset.fileName ?? undefined,
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('오류', '카메라를 실행할 수 없습니다.');
    }
  };

  // Image Picker: Select from gallery
  const handleImagePicker = async () => {
    try {
      // Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImageSelected?.({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.mimeType,
          fileName: asset.fileName ?? undefined,
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('오류', '이미지를 선택할 수 없습니다.');
    }
  };

  // Document Picker: Select files
  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onFileSelected?.({
          uri: asset.uri,
          name: asset.name,
          size: asset.size ?? undefined,
          mimeType: asset.mimeType ?? undefined,
        });
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('오류', '파일을 선택할 수 없습니다.');
    }
  };

  return (
    <View
      className='mx-[10px] mt-[10px] overflow-hidden rounded-[12px] border border-gray-400 bg-white'
      style={{ marginBottom: bottomMargin }}>
      {/* Editing Indicator */}
      {isEditing && (
        <View className='flex-row items-center justify-between border-b border-gray-300 bg-blue-50 px-[12px] py-[8px]'>
          <View className='flex-row items-center gap-[8px]'>
            <Pencil size={16} color={colors['primary-500']} />
            <Text className='text-14sb text-primary-500'>메시지 수정 중</Text>
          </View>
          <AnimatedPressable onPress={handleCancelEdit} hitSlop={8} className='p-1'>
            <X size={18} color={colors['gray-600']} />
          </AnimatedPressable>
        </View>
      )}

      {/* Reply Preview */}
      {replyTo && !isEditing && (
        <ReplyPreview message={replyTo} senderName={senderName} onClose={() => onClearReply?.()} />
      )}

      {/* Input Area */}
      <View
        className={`flex-row items-center gap-[10px] py-[6px] ${isTypingMode ? 'pr-[6px] pl-[12px]' : 'pr-[8px] pl-[8px]'}`}>
        {/* Camera Button - hidden in typing mode or editing mode */}
        {!isTypingMode && !isEditing && (
          <TrackedAnimatedPressable
            buttonId='upload_image'
            onPress={handleCamera}
            disabled={disabled}
            className={`bg-primary-500 h-[30px] w-[30px] items-center justify-center rounded-full ${
              disabled ? 'opacity-50' : ''
            }`}>
            <Camera size={20} color='white' />
          </TrackedAnimatedPressable>
        )}

        {/* Text Input */}
        <View className='flex-1 justify-center'>
          <TextInput
            value={text}
            onChangeText={setText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            placeholderTextColor={colors['gray-600']}
            multiline
            maxLength={1000}
            editable={!disabled}
            className='text-16r text-black'
            style={{
              minHeight: 22,
              maxHeight: 88, // approximately 4 lines
              lineHeight: 22,
              paddingTop: Platform.OS === 'ios' ? 2 : 0,
              paddingBottom: Platform.OS === 'ios' ? 2 : 0,
              textAlignVertical: 'center',
            }}
          />
        </View>

        {/* Action Buttons - hidden in typing mode or editing mode */}
        {!isTypingMode && !isEditing && (
          <View className='flex-row'>
            <IconButton
              icon={ImageIcon}
              onPress={handleImagePicker}
              disabled={disabled}
              buttonId='upload_image'
            />
            <IconButton icon={Paperclip} onPress={handleDocumentPicker} disabled={disabled} />
          </View>
        )}

        {/* Send/Update Button - shown only in typing mode or editing mode */}
        {(isTypingMode || isEditing) && (
          <TrackedAnimatedPressable
            buttonId='send_message'
            onPress={handleSend}
            disabled={!canSend}
            className={`h-[36px] w-[36px] items-center justify-center rounded-[10px] ${
              canSend ? 'bg-primary-500' : 'bg-gray-300'
            }`}>
            <ArrowUp size={22} color='white' />
          </TrackedAnimatedPressable>
        )}
      </View>
    </View>
  );
};

export default MessageInput;
