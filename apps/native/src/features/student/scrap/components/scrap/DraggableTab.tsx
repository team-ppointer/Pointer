import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, type ScrollView, type LayoutChangeEvent } from 'react-native';
import { X } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  type SharedValue,
  runOnJS,
} from 'react-native-reanimated';

import { colors } from '@/theme/tokens';
import { useNoteStore, type Note } from '@/features/student/scrap/stores/scrapNoteStore';

export interface DraggableTabProps {
  note: Note;
  index: number;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
  tabLayouts: Record<number, { x: number; width: number }>;
  scrollViewRef: React.RefObject<ScrollView | null>;
  scrollX: SharedValue<number>;
  screenWidth: number;
}

export const DraggableTab = ({
  note,
  index,
  isActive,
  onPress,
  onClose,
  onLayout,
  onDragEnd,
  tabLayouts,
  scrollViewRef,
  scrollX,
  screenWidth,
}: DraggableTabProps) => {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const { openNotes } = useNoteStore();

  const autoScroll = useCallback(
    (currentX: number) => {
      if (!scrollViewRef.current) return;

      const currentLayout = tabLayouts[note.id];
      if (!currentLayout) return;

      // 탭의 실제 화면상 위치 (스크롤 오프셋 고려)
      const absoluteX = currentLayout.x - scrollX.value + currentX;
      const tabRight = absoluteX + currentLayout.width;
      const tabLeft = absoluteX;

      const visibleLeft = 0;
      const visibleRight = screenWidth;
      const scrollThreshold = 100;
      const scrollSpeed = 0.4;

      let newScrollX = scrollX.value;
      let shouldScroll = false;

      // 오른쪽으로 스크롤
      if (tabRight > visibleRight - scrollThreshold) {
        const distance = tabRight - (visibleRight - scrollThreshold);
        newScrollX = scrollX.value + distance * scrollSpeed;
        shouldScroll = true;
      }
      // 왼쪽으로 스크롤
      else if (tabLeft < visibleLeft + scrollThreshold) {
        const distance = visibleLeft + scrollThreshold - tabLeft;
        newScrollX = scrollX.value - distance * scrollSpeed;
        shouldScroll = true;
      }

      if (shouldScroll && Math.abs(newScrollX - scrollX.value) > 0.5) {
        scrollViewRef.current.scrollTo({
          x: Math.max(0, newScrollX),
          animated: false,
        });
      }
    },
    [tabLayouts, note.id, scrollViewRef, scrollX, screenWidth]
  );

  const panGesture = Gesture.Pan()
    .enabled(isActive) // 활성 탭일 때만 드래그 가능
    .onStart(() => {
      // 활성 탭이 아니면 드래그 시작하지 않음
      if (!isActive) return;

      startX.value = translateX.value;
      runOnJS(setIsDragging)(true);
    })
    .onUpdate((e) => {
      // 활성 탭이 아니면 업데이트하지 않음
      if (!isActive) return;

      translateX.value = startX.value + e.translationX;

      // 드래그 중 자동 스크롤
      const currentX = startX.value + e.translationX;
      runOnJS(autoScroll)(currentX);
    })
    .onEnd((e) => {
      // 활성 탭이 아니면 종료하지 않음
      if (!isActive) {
        translateX.value = withSpring(0);
        runOnJS(setIsDragging)(false);
        return;
      }

      const finalX = startX.value + e.translationX;
      const currentLayout = tabLayouts[note.id];

      if (!currentLayout) {
        translateX.value = withSpring(0);
        runOnJS(setIsDragging)(false);
        return;
      }

      // 드래그된 위치를 기반으로 새로운 인덱스 계산
      const newPosition = currentLayout.x + finalX;
      let newIndex = index;

      // 다른 탭들의 위치와 비교하여 새로운 인덱스 결정
      openNotes.forEach((otherNote, otherIndex) => {
        const otherLayout = tabLayouts[otherNote.id];
        if (otherLayout && otherIndex !== index) {
          const otherCenter = otherLayout.x + otherLayout.width / 2;
          const currentCenter = currentLayout.x + currentLayout.width / 2 + finalX;

          if (otherIndex < index && currentCenter < otherCenter) {
            newIndex = Math.min(newIndex, otherIndex);
          } else if (otherIndex > index && currentCenter > otherCenter) {
            newIndex = Math.max(newIndex, otherIndex + 1);
          }
        }
      });

      newIndex = Math.max(0, Math.min(newIndex, openNotes.length - 1));

      if (newIndex !== index) {
        runOnJS(onDragEnd)(index, newIndex);
      }

      translateX.value = withSpring(0);
      runOnJS(setIsDragging)(false);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        onLayout={onLayout}
        style={[animatedStyle, { height: 34, minWidth: 170, maxWidth: 300 }]}
        className={`flex-row items-center gap-2 border-x border-gray-600 px-[10px] ${
          isActive ? 'bg-gray-100' : 'bg-gray-500'
        }`}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className='rounded-ful items-center justify-center'>
          <X size={16} color={colors['gray-700']} />
        </Pressable>
        <Pressable onPress={onPress} className='flex-1 flex-row items-center justify-center gap-2'>
          <Text
            className={`text-14m text-gray-800`}
            ellipsizeMode='tail'
            numberOfLines={1}
            style={{ flexShrink: 1, textAlign: 'center' }}>
            {note.title}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};
