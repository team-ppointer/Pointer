import React, { useState } from 'react';
import { Text, View, TextInput, Pressable, Platform, Alert } from 'react-native';
import { Camera, ImageIcon, Paperclip, ArrowUp } from 'lucide-react-native';
import { colors } from '@theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import type { Message } from '../../types';
import ReplyPreview from './ReplyPreview';

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
  senderName?: string;
  onClearReply?: () => void;
  onSend: (text: string, replyTo?: Message) => void;
  onImageSelected?: (image: SelectedImage) => void;
  onFileSelected?: (file: SelectedFile) => void;
  placeholder?: string;
  disabled?: boolean;
}

const IconButton = ({
  onPress,
  icon: Icon,
  disabled,
}: {
  onPress?: () => void;
  icon: typeof Camera;
  disabled?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    className={`h-[36px] w-[36px] items-center justify-center rounded-full ${
      disabled ? 'opacity-50' : 'active:bg-gray-200'
    }`}>
    <Icon size={22} color={colors['gray-600']} />
  </Pressable>
);

const MessageInput = ({
  replyTo,
  senderName,
  onClearReply,
  onSend,
  onImageSelected,
  onFileSelected,
  placeholder = '무엇이든 물어보세요.',
  disabled,
}: MessageInputProps) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim(), replyTo ?? undefined);
    setText('');
    onClearReply?.();
  };

  const canSend = text.trim().length > 0 && !disabled;

  // Show typing mode when focused or has text
  const isTypingMode = isFocused || text.length > 0;

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
      style={{ marginBottom: 10 }}>
      {/* Reply Preview */}
      {replyTo && (
        <ReplyPreview message={replyTo} senderName={senderName} onClose={() => onClearReply?.()} />
      )}

      {/* Input Area */}
      <View
        className={`flex-row items-center gap-[10px] py-[6px] ${isTypingMode ? 'pl-[12px] pr-[6px]' : 'pl-[8px] pr-[8px]'}`}>
        {/* Camera Button - hidden in typing mode */}
        {!isTypingMode && (
          <Pressable
            onPress={handleCamera}
            disabled={disabled}
            className={`bg-primary-500 h-[30px] w-[30px] items-center justify-center rounded-full ${
              disabled ? 'opacity-50' : 'active:bg-primary-600'
            }`}>
            <Camera size={20} color='white' />
          </Pressable>
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

        {/* Action Buttons - hidden in typing mode */}
        {!isTypingMode && (
          <View className='flex-row'>
            <IconButton icon={ImageIcon} onPress={handleImagePicker} disabled={disabled} />
            <IconButton icon={Paperclip} onPress={handleDocumentPicker} disabled={disabled} />
          </View>
        )}

        {/* Send Button - shown only in typing mode */}
        {isTypingMode && (
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            className={`h-[36px] w-[36px] items-center justify-center rounded-[10px] ${
              canSend ? 'bg-primary-500 active:bg-primary-600' : 'bg-gray-300'
            }`}>
            <ArrowUp size={22} color='white' />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default MessageInput;
