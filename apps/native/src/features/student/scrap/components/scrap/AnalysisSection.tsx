import React from 'react';
import { View, Text } from 'react-native';
import { BookmarkIcon } from 'lucide-react-native';
import { colors } from '@/theme/tokens';
import ProblemViewer from '../../../problem/components/ProblemViewer';

interface AnalysisSectionProps {
  label: string;
  content: string;
  isScraped?: boolean;
  showBookmark?: boolean;
  minHeight?: number;
  padding?: number;
}

export const AnalysisSection = ({
  label,
  content,
  isScraped = false,
  showBookmark = true,
  minHeight = 100,
  padding = 14,
}: AnalysisSectionProps) => {
  return (
    <View className='flex-col rounded-[8px] border border-gray-400 bg-white p-[14px]'>
      <View className='mb-[10px] flex-row items-start justify-between'>
        <View className='bg-primary-100 rounded-[4px] px-[6px] py-[2px]'>
          <Text className='text-16b text-primary-500'>{label}</Text>
        </View>
        {showBookmark && (
          <View className='h-[32px] w-[32px] items-center justify-center'>
            <BookmarkIcon
              size={20}
              color={isScraped ? colors['gray-800'] : colors['gray-600']}
              fill={isScraped ? colors['gray-800'] : 'transparent'}
            />
          </View>
        )}
      </View>
      <ProblemViewer problemContent={content} minHeight={minHeight} padding={padding} />
    </View>
  );
};
