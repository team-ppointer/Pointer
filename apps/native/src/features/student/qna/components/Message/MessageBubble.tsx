import React from 'react';
import { Text, View, Image, Pressable, StyleSheet } from 'react-native';
import { FileText, ImageIcon, Reply, User } from 'lucide-react-native';
import { colors } from '@theme/tokens';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
  SharedValue,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  globalTranslateX: SharedValue<number>;
  senderName?: string;
  profileImageUrl?: string;
  showProfile?: boolean;
  showTail?: boolean;
  onReply?: (message: Message) => void;
  onPressImage?: (url: string) => void;
  onPressFile?: (url: string) => void;
}

const LEFT_SWIPE_THRESHOLD = -80;
const RIGHT_SWIPE_THRESHOLD = 60;
const REPLY_TRIGGER_THRESHOLD = 50;
const TIMESTAMP_WIDTH = 50;
const PROFILE_SIZE = 36;
const PROFILE_GAP = 8;

// Bubble Tail Component - Left (for other's messages)
const LeftBubbleTail = () => (
  <View className='absolute -left-[8px] top-[7px]'>
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
  <View className='absolute -right-[8px] top-[7px]'>
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

// File Attachment Component
const FileAttachment = ({
  file,
  isMe,
  onPress,
}: {
  file: Message['file'];
  isMe: boolean;
  onPress?: () => void;
}) => {
  if (!file) return null;

  return (
    <Pressable onPress={onPress} className='flex-row items-center gap-[10px]'>
      <View className='h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-gray-400 bg-white'>
        <FileText size={18} color='#ddd' />
      </View>
      <View className='flex-1'>
        <Text className='text-16m text-black' numberOfLines={1}>
          {file.name}
        </Text>
        <Text className='text-12r text-gray-800'>{file.extension}</Text>
      </View>
    </Pressable>
  );
};

// Image Message Component
const ImageMessage = ({ image, onPress }: { image: Message['image']; onPress?: () => void }) => {
  if (!image) return null;

  return (
    <Pressable onPress={onPress} className='overflow-hidden rounded-[8px]'>
      <Image
        source={{ uri: image.url }}
        className='h-[200px] w-[250px] rounded-[8px] bg-gray-200'
        resizeMode='cover'
      />
    </Pressable>
  );
};

// Profile Image Component
const ProfileImage = ({ imageUrl }: { imageUrl?: string }) => {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: PROFILE_SIZE, height: PROFILE_SIZE }}
        className='rounded-full bg-gray-300'
      />
    );
  }

  return (
    <View
      style={{ width: PROFILE_SIZE, height: PROFILE_SIZE }}
      className='items-center justify-center rounded-full bg-gray-300'>
      <User size={20} color={colors['gray-600']} />
    </View>
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
  onPressImage,
  onPressFile,
}: MessageBubbleProps) => {
  const { type, sender, content, timestamp, reply, file, image } = message;
  const isMe = sender === 'me';

  // Local translateX for reply swipe (right direction only)
  const localTranslateX = useSharedValue(0);

  const triggerReply = () => {
    onReply?.(message);
  };

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
      case 'file':
        return (
          <FileAttachment
            file={file}
            isMe={isMe}
            onPress={() => file?.url && onPressFile?.(file.url)}
          />
        );
      case 'image':
        return (
          <ImageMessage image={image} onPress={() => image?.url && onPressImage?.(image.url)} />
        );
      case 'reply-text':
      case 'reply-image':
        return (
          <View>
            <ReplyPreview reply={reply} isMe={isMe} />
            <Text className='text-16r text-black'>{content}</Text>
          </View>
        );
      case 'text':
      default:
        return <Text className='text-16r text-black'>{content}</Text>;
    }
  };

  const needsBubbleBackground =
    type === 'text' || type === 'reply-text' || type === 'reply-image' || type === 'file';

  return (
    <View className='relative overflow-hidden'>
      {/* Hidden Reply Icon - positioned on the left */}
      <Animated.View
        style={[styles.replyIconContainer, animatedReplyIconStyle]}
        className='absolute bottom-0 left-[16px] top-0 justify-center'>
        <View className='h-[32px] w-[32px] items-center justify-center rounded-full bg-gray-300'>
          <Reply size={18} color={colors['gray-700']} />
        </View>
      </Animated.View>

      {/* Hidden Timestamp - positioned on the right */}
      <Animated.View
        style={[styles.timestampContainer, animatedTimestampStyle]}
        className='absolute bottom-0 right-[16px] top-0 justify-center'>
        <Text className='text-10r text-gray-600'>{timestamp}</Text>
      </Animated.View>

      {/* Swipeable Message Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={animatedBubbleStyle}
          className={`bg-gray-200 px-[16px] py-[4px] ${isMe ? 'items-end' : 'items-start'}`}>
          {/* Profile + Message container for other's messages */}
          {!isMe ? (
            <View className='flex-row items-start' style={{ gap: PROFILE_GAP }}>
              {/* Profile Image - only shown for first message in consecutive messages */}
              {showProfile ? (
                <ProfileImage imageUrl={profileImageUrl} />
              ) : (
                <View style={{ width: PROFILE_SIZE }} />
              )}

              {/* Message Content */}
              <View className='flex-1'>
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
                    className={`max-w-[70%] ${
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
