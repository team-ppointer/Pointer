import React, { useCallback, useState } from 'react';
import {
  Text,
  View,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import {
  FileText,
  ImageIcon,
  ImageOff,
  Reply,
  User,
  File,
  FileSpreadsheet,
} from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
  type SharedValue,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { colors } from '@theme/tokens';

import type { Message, UploadFileResp } from '../../types';

interface MessageBubbleProps {
  message: Message;
  globalTranslateX: SharedValue<number>;
  senderName?: string;
  profileImageUrl?: string;
  showProfile?: boolean;
  showTail?: boolean;
  onReply?: (message: Message) => void;
  onPressImages?: (images: { uri: string }[], initialIndex: number) => void;
  onPressFile?: (url: string) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

const LEFT_SWIPE_THRESHOLD = -90;
const RIGHT_SWIPE_THRESHOLD = 60;
const REPLY_TRIGGER_THRESHOLD = 50;
const TIMESTAMP_WIDTH = 80;
const PROFILE_SIZE = 36;
const PROFILE_GAP = 8;

// Bubble Tail Component - Left (for other's messages)
const LeftBubbleTail = () => (
  <View className='absolute top-[7px] -left-[8px]'>
    <Svg width={11} height={12} viewBox='0 0 11 12' fill='none'>
      <Path
        d='M0.306379 1.70711L11 12V0H1.04102C0.115425 0 -0.348112 1.07714 0.306379 1.70711Z'
        fill='white'
      />
    </Svg>
  </View>
);

// Bubble Tail Component - Right (for my messages)
const RightBubbleTail = () => (
  <View className='absolute top-[7px] -right-[8px]'>
    <Svg width={11} height={12} viewBox='0 0 11 12' fill='none'>
      <Path
        d='M10.6936 1.70711L0 12V0H9.95898C10.8846 0 11.3481 1.07714 10.6936 1.70711Z'
        fill={colors['blue-200']}
      />
    </Svg>
  </View>
);
// Reply Preview Component
const ReplyPreview = ({ reply, isMe }: { reply: Message['reply']; isMe: boolean }) => {
  if (!reply) return null;

  return (
    <View className='mb-[8px] border-b border-gray-500 pb-[8px]'>
      <Text className='text-12r mb-[2px] text-black'>{reply.title}</Text>
      {reply.type === 'image' && reply.imageUrl ? (
        <View className='flex-row items-center gap-[6px]'>
          <ImageIcon size={14} color={colors['gray-600']} />
          <Text className='text-12r text-gray-600'>사진</Text>
        </View>
      ) : (
        <Text className='text-12r text-gray-600' numberOfLines={2}>
          {reply.content}
        </Text>
      )}
    </View>
  );
};

// Helper: Get file extension from filename
const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
};

// Helper: Get file icon based on extension
const getFileIcon = (extension: string) => {
  const ext = extension.toLowerCase();

  // Document types
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return FileText;
  }
  // Spreadsheet types
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return FileSpreadsheet;
  }
  // Default
  return File;
};

// Helper: Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// File Attachment Component
const FileAttachment = ({
  file,
  uploadFile,
  isMe,
  onDownload,
  isDownloading,
}: {
  file?: Message['file'];
  uploadFile?: UploadFileResp;
  isMe: boolean;
  onDownload?: (url: string, fileName: string) => void;
  isDownloading?: boolean;
}) => {
  // Get file info from either source
  const fileName = file?.name ?? uploadFile?.fileName ?? 'Unknown File';
  const fileUrl = file?.url ?? uploadFile?.url ?? '';
  const extension = file?.extension ?? getFileExtension(fileName);
  const fileType = uploadFile?.fileType ?? 'OTHER';

  if (!fileName || !fileUrl) return null;

  const FileIcon = getFileIcon(extension);
  const iconColor = isMe ? colors['blue-500'] : colors['gray-600'];

  const handlePress = () => {
    if (onDownload && fileUrl) {
      onDownload(fileUrl, fileName);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDownloading}
      className='min-w-[200px] flex-row items-center gap-[10px]'>
      <View
        className={`size-[36px] items-center justify-center rounded-[6px] border border-gray-400 bg-white`}>
        {isDownloading ? (
          <ActivityIndicator size='small' color={iconColor} />
        ) : (
          <FileIcon size={18} color='#ddd' />
        )}
      </View>
      <View className='flex-1 shrink'>
        <Text className='text-16m text-black' numberOfLines={1}>
          {fileName}
        </Text>
        <Text className='text-12r text-gray-800'>{extension}</Text>
      </View>
    </Pressable>
  );
};

// Single Image Component
const SingleImage = ({
  url,
  onPress,
  size = 'large',
}: {
  url: string;
  onPress?: () => void;
  size?: 'large' | 'medium' | 'small';
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeStyles = {
    large: 'h-[200px] w-[250px]',
    medium: 'h-[120px] w-[120px]',
    small: 'h-[80px] w-[80px]',
  };

  if (hasError) {
    const errorClasses = `${sizeStyles[size]} items-center justify-center rounded-[8px] border border-gray-200 bg-gray-100`;
    return (
      <View className={errorClasses}>
        <ImageOff size={24} color={colors['gray-400']} />
        <Text className='text-12r mt-1 text-center text-gray-400'>이미지를 불러올 수 없습니다</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} className='overflow-hidden rounded-[8px]'>
      <Image
        source={{ uri: url }}
        className={`${sizeStyles[size]} rounded-[8px] bg-gray-200`}
        resizeMode='cover'
        onError={() => setHasError(true)}
      />
    </Pressable>
  );
};

// Multiple Images Grid Component - shows all images in 2-column grid
const ImagesGrid = ({
  images,
  onPressImage,
}: {
  images: NonNullable<Message['files']>;
  onPressImage?: (images: { uri: string }[], index: number) => void;
}) => {
  const count = images.length;
  const imageUris = images.map((img) => ({ uri: img.url }));

  // Single image - show large
  if (count === 1) {
    return (
      <SingleImage url={images[0].url} onPress={() => onPressImage?.(imageUris, 0)} size='large' />
    );
  }

  // 2 images - show side by side
  if (count === 2) {
    return (
      <View className='flex-row gap-[4px]'>
        {images.map((img, index) => (
          <SingleImage
            key={img.id ?? index}
            url={img.url}
            onPress={() => onPressImage?.(imageUris, index)}
            size='medium'
          />
        ))}
      </View>
    );
  }

  // 3+ images - 2-column grid layout
  const rows: { img: (typeof images)[0]; index: number }[][] = [];
  for (let i = 0; i < images.length; i += 2) {
    const row: { img: (typeof images)[0]; index: number }[] = [];
    row.push({ img: images[i], index: i });
    if (i + 1 < images.length) {
      row.push({ img: images[i + 1], index: i + 1 });
    }
    rows.push(row);
  }

  return (
    <View className='gap-[4px]'>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className='flex-row gap-[4px]'>
          {row.map(({ img, index }) => (
            <SingleImage
              key={img.id ?? index}
              url={img.url}
              onPress={() => onPressImage?.(imageUris, index)}
              size='medium'
            />
          ))}
        </View>
      ))}
    </View>
  );
};

// Image Message Component (supports multiple images and files)
const ImageMessage = ({
  image,
  files,
  isMe,
  onPressImages,
  onDownload,
  downloadingFiles,
}: {
  image?: Message['image'];
  files?: Message['files'];
  isMe: boolean;
  onPressImages?: (images: { uri: string }[], index: number) => void;
  onDownload?: (url: string, fileName: string) => void;
  downloadingFiles?: Set<string>;
}) => {
  // Use files array if available, otherwise fallback to single image
  if (files && files.length > 0) {
    // Separate IMAGE and non-IMAGE files
    const imageFiles = files.filter((f) => f.fileType === 'IMAGE');
    const otherFiles = files.filter((f) => f.fileType !== 'IMAGE');

    return (
      <View className='gap-[8px]'>
        {/* Render images */}
        {imageFiles.length > 0 && <ImagesGrid images={imageFiles} onPressImage={onPressImages} />}

        {/* Render other files (documents, etc.) */}
        {otherFiles.map((file) => (
          <FileAttachment
            key={file.id}
            uploadFile={file}
            isMe={isMe}
            onDownload={onDownload}
            isDownloading={downloadingFiles?.has(file.url)}
          />
        ))}
      </View>
    );
  }

  // Fallback to single image
  if (image) {
    const imageUris = [{ uri: image.url }];
    return (
      <SingleImage url={image.url} onPress={() => onPressImages?.(imageUris, 0)} size='large' />
    );
  }

  return null;
};

// Profile Image Component
const ProfileImage = ({ imageUrl }: { imageUrl?: string }) => {
  const [hasError, setHasError] = useState(false);

  const fallback = (
    <View
      style={{ width: PROFILE_SIZE, height: PROFILE_SIZE }}
      className='items-center justify-center rounded-full bg-gray-300'>
      <User size={20} color={colors['gray-600']} />
    </View>
  );

  if (!imageUrl || hasError) {
    return fallback;
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={{ width: PROFILE_SIZE, height: PROFILE_SIZE }}
      className='rounded-full bg-gray-300'
      onError={() => setHasError(true)}
    />
  );
};

const MessageBubble = ({
  message,
  globalTranslateX,
  senderName,
  profileImageUrl,
  showProfile = false,
  showTail = false,
  onReply,
  onPressImages,
  onPressFile,
  onEdit,
  onDelete,
}: MessageBubbleProps) => {
  const { type, sender, content, timestamp, reply, file, image, files, isEdited } = message;
  const isMe = sender === 'me';

  // Track downloading files
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  // Local translateX for reply swipe (right direction only)
  const localTranslateX = useSharedValue(0);

  const triggerReply = () => {
    onReply?.(message);
  };

  // Show action sheet for edit/delete (only for my messages)
  const showMessageActions = useCallback(() => {
    if (!isMe) return;

    // Haptic feedback
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '수정', '삭제'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
          title: '메시지 옵션',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            onEdit?.(message);
          } else if (buttonIndex === 2) {
            // Confirm delete
            Alert.alert('메시지 삭제', '이 메시지를 삭제하시겠습니까?', [
              { text: '취소', style: 'cancel' },
              {
                text: '삭제',
                style: 'destructive',
                onPress: () => onDelete?.(message),
              },
            ]);
          }
        }
      );
    } else {
      // Android fallback using Alert
      Alert.alert('메시지 옵션', undefined, [
        { text: '취소', style: 'cancel' },
        { text: '수정', onPress: () => onEdit?.(message) },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert('메시지 삭제', '이 메시지를 삭제하시겠습니까?', [
              { text: '취소', style: 'cancel' },
              {
                text: '삭제',
                style: 'destructive',
                onPress: () => onDelete?.(message),
              },
            ]);
          },
        },
      ]);
    }
  }, [isMe, message, onEdit, onDelete]);

  // Handle file download - opens file URL in browser/default app
  const handleDownload = useCallback(async (url: string, fileName: string) => {
    try {
      // Add to downloading set for UI feedback
      setDownloadingFiles((prev) => new Set(prev).add(url));

      // Try to open the URL
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('오류', '파일을 열 수 없습니다.');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('오류', '파일을 열 수 없습니다.');
    } finally {
      // Remove from downloading set
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
    }
  }, []);

  // Long press gesture for edit/delete options (only for my messages)
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .enabled(isMe)
    .onEnd((event, success) => {
      'worklet';
      if (success) {
        runOnJS(showMessageActions)();
      }
    });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      'worklet';
      if (event.translationX > 0) {
        // Right swipe for reply (local, individual bubble)
        localTranslateX.value = Math.min(event.translationX, RIGHT_SWIPE_THRESHOLD);
      } else {
        // Left swipe for time display (global, all bubbles)
        globalTranslateX.value = Math.max(event.translationX, LEFT_SWIPE_THRESHOLD);
      }
    })
    .onEnd((event) => {
      'worklet';
      const timingConfig = {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      };

      if (event.translationX > 0) {
        // Right swipe ended - check if reply should trigger
        if (event.translationX >= REPLY_TRIGGER_THRESHOLD) {
          runOnJS(triggerReply)();
        }
        localTranslateX.value = withTiming(0, timingConfig);
      } else {
        // Left swipe ended - reset global translateX
        globalTranslateX.value = withTiming(0, timingConfig);
      }
    });

  // Combine gestures: long press and pan can work together
  const composedGesture = Gesture.Race(longPressGesture, panGesture);

  // Combined translateX: global (left swipe for time) + local (right swipe for reply)
  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: globalTranslateX.value + localTranslateX.value }],
  }));

  // Timestamp animation (only responds to global left swipe)
  const animatedTimestampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      globalTranslateX.value,
      [0, LEFT_SWIPE_THRESHOLD / 2, LEFT_SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateX: interpolate(
          globalTranslateX.value,
          [0, LEFT_SWIPE_THRESHOLD],
          [20, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // Reply icon animation (only responds to local right swipe)
  const animatedReplyIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      localTranslateX.value,
      [0, REPLY_TRIGGER_THRESHOLD / 2, REPLY_TRIGGER_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateX: interpolate(
          localTranslateX.value,
          [0, RIGHT_SWIPE_THRESHOLD],
          [-20, 0],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(
          localTranslateX.value,
          [0, REPLY_TRIGGER_THRESHOLD],
          [0.5, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const renderContent = () => {
    switch (type) {
      case 'file': {
        const fileUrl = file?.url ?? files?.[0]?.url;
        const isFileDownloading = fileUrl ? downloadingFiles.has(fileUrl) : false;
        return (
          <FileAttachment
            file={file}
            uploadFile={files?.[0]}
            isMe={isMe}
            onDownload={handleDownload}
            isDownloading={isFileDownloading}
          />
        );
      }
      case 'image':
        return (
          <ImageMessage
            image={image}
            files={files}
            isMe={isMe}
            onPressImages={onPressImages}
            onDownload={handleDownload}
            downloadingFiles={downloadingFiles}
          />
        );
      case 'reply-text':
      case 'reply-image':
        return (
          <View>
            <ReplyPreview reply={reply} isMe={isMe} />
            {/* Show files if present in reply */}
            {files && files.length > 0 && (
              <View className='mb-[8px]'>
                <ImageMessage
                  files={files}
                  isMe={isMe}
                  onPressImages={onPressImages}
                  onDownload={handleDownload}
                  downloadingFiles={downloadingFiles}
                />
              </View>
            )}
            {content && <Text className='text-16r text-black'>{content}</Text>}
          </View>
        );
      case 'text':
      default:
        return <Text className='text-16r text-black'>{content.trim()}</Text>;
    }
  };

  const needsBubbleBackground =
    type === 'text' || type === 'reply-text' || type === 'reply-image' || type === 'file';

  return (
    <View className='relative overflow-hidden'>
      {/* Hidden Reply Icon - positioned on the left */}
      <Animated.View
        style={[styles.replyIconContainer, animatedReplyIconStyle]}
        className='absolute inset-y-0 left-[16px] justify-center'>
        <View className='size-[32px] items-center justify-center rounded-full bg-gray-300'>
          <Reply size={18} color={colors['gray-700']} />
        </View>
      </Animated.View>

      {/* Hidden Timestamp - positioned on the right */}
      <Animated.View
        style={[styles.timestampContainer, animatedTimestampStyle]}
        className='absolute inset-y-0 right-[16px] justify-center'>
        <Text className='text-10r text-gray-600'>
          {isEdited ? `${timestamp}에 수정됨` : timestamp}
        </Text>
      </Animated.View>

      {/* Swipeable Message Content */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={animatedBubbleStyle}
          className={`bg-gray-200 px-[16px] py-[4px] ${isMe ? 'items-end' : 'items-start'}`}>
          {/* Profile + Message container for other's messages */}
          {!isMe ? (
            <View className='flex-row items-start' style={{ gap: PROFILE_GAP, maxWidth: '85%' }}>
              {/* Profile Image - only shown for first message in consecutive messages */}
              {showProfile ? (
                <ProfileImage imageUrl={profileImageUrl} />
              ) : (
                <View style={{ width: PROFILE_SIZE }} />
              )}

              {/* Message Content */}
              <View className='flex-col items-start'>
                {/* Sender Name - only for first message */}
                {showProfile && senderName && (
                  <Text className='text-12sb mb-[4px] text-gray-700'>{senderName}</Text>
                )}

                {/* Message Bubble with Tail */}
                <View className='relative'>
                  {/* Left Tail - only for first message in consecutive messages */}
                  {showTail && needsBubbleBackground && <LeftBubbleTail />}

                  {/* Message Bubble */}
                  <View
                    className={`${
                      needsBubbleBackground ? 'rounded-[8px] bg-white px-[12px] py-[8px]' : ''
                    }`}>
                    {renderContent()}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* My message */
            <View className='relative'>
              {/* Right Tail - only for first message in consecutive messages */}
              {showTail && needsBubbleBackground && <RightBubbleTail />}

              {/* Message Bubble */}
              <View
                className={`max-w-[70%] ${
                  needsBubbleBackground ? 'rounded-[8px] bg-blue-200 px-[12px] py-[8px]' : ''
                }`}>
                {renderContent()}
              </View>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  timestampContainer: {
    width: TIMESTAMP_WIDTH,
    zIndex: -1,
  },
  replyIconContainer: {
    width: 40,
    zIndex: -1,
  },
});

export default MessageBubble;
