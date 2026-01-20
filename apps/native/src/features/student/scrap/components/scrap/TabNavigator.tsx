import React, { useRef } from 'react';
import { View, ScrollView, LayoutChangeEvent, Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Note } from '@/features/student/scrap/stores/scrapNoteStore';
import { DraggableTab } from './DraggableTab';

export interface TabNavigatorProps {
  openNotes: Note[];
  activeNoteId: number | null;
  onTabPress: (noteId: number) => void;
  onTabClose: (noteId: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  tabLayouts: Record<number, { x: number; width: number }>;
  onTabLayout: (noteId: number, event: LayoutChangeEvent) => void;
}

export const TabNavigator = ({
  openNotes,
  activeNoteId,
  onTabPress,
  onTabClose,
  onReorder,
  tabLayouts,
  onTabLayout,
}: TabNavigatorProps) => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollX = useSharedValue(0);
  const screenWidth = Dimensions.get('window').width;

  if (openNotes.length <= 1) {
    return null;
  }

  return (
    <View className='flex-row border-b border-gray-300 bg-gray-800'>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        className='flex-row'
        onScroll={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;
          scrollX.value = offsetX;
        }}
        scrollEventThrottle={1}>
        {openNotes.map((note, index) => (
          <DraggableTab
            key={note.id}
            note={note}
            index={index}
            isActive={note.id === activeNoteId}
            onPress={() => onTabPress(note.id)}
            onClose={() => onTabClose(note.id)}
            onLayout={(event: LayoutChangeEvent) => onTabLayout(note.id, event)}
            onDragEnd={onReorder}
            tabLayouts={tabLayouts}
            scrollViewRef={scrollViewRef}
            scrollX={scrollX}
            screenWidth={screenWidth}
          />
        ))}
      </ScrollView>
    </View>
  );
};
