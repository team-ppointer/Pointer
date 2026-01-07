import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Maximize2 } from 'lucide-react-native';
import ProblemViewer from '../../../problem/components/ProblemViewer';
import { colors } from '@/theme/tokens';

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
      <View className='gap-[6px] rounded-[8px] border border-gray-500 bg-white p-[14px]'>
        <Text className='text-16b text-black'>문제 본문</Text>
        <ProblemViewer problemContent={problemContent} minHeight={200} padding={14} />
        {thumbnailUrl && (
          <Pressable className='relative' onPress={onHoverStart}>
            <View style={{ borderRadius: 8, overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
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
        )}
      </View>
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
