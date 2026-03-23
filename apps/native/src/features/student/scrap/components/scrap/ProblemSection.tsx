import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Maximize2 } from 'lucide-react-native';

import { colors } from '@/theme/tokens';

import ProblemViewer from '../../../problem/components/ProblemViewer';

export interface ProblemSectionProps {
  problemContent?: string;
  thumbnailUrl?: string;
  isHovering: boolean;
  onHoverStart: () => void;
  onExpand: () => void;
}

export const ProblemSection = ({
  problemContent,
  thumbnailUrl,
  isHovering,
  onHoverStart,
  onExpand,
}: ProblemSectionProps) => {
  if (problemContent) {
    return (
      <Pressable
        className='gap-[6px] rounded-[8px] border border-gray-500 bg-white p-[14px] shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)]'
        onPress={onHoverStart}>
        {/* <Text className='text-16b text-gray-600'>문제 본문</Text> */}
        <ProblemViewer
          problemContent={problemContent}
          minHeight={200}
          padding={14}
          fontStyle='serif'
        />
        {isHovering && (
          <Pressable
            onPress={onExpand}
            className='absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2'>
            <Maximize2 size={20} color='#FFF' />
          </Pressable>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable className='relative' onPress={onHoverStart}>
      <View style={{ borderRadius: 8, overflow: 'hidden', backgroundColor: colors['gray-400'] }}>
        <Image
          source={{ uri: thumbnailUrl }}
          style={{ width: '100%', height: 270 }}
          resizeMode='contain'
        />
      </View>
      {isHovering && (
        <Pressable
          onPress={onExpand}
          className='absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2'>
          <Maximize2 size={20} color='#FFF' />
        </Pressable>
      )}
    </Pressable>
  );
};
