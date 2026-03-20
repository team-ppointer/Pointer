import React from 'react';
import { View, Text } from 'react-native';
import ProblemViewer from '../../../problem/components/ProblemViewer';
import { PointingWithLabel } from '../../utils/scrapFilters';

export interface PointingsListProps {
  pointingsWithLabels: PointingWithLabel[];
  shouldShowPointing: (index: number) => boolean;
}

export const PointingsList = ({ pointingsWithLabels, shouldShowPointing }: PointingsListProps) => {
  return (
    <>
      {pointingsWithLabels.map((pointing, idx) => {
        if (!shouldShowPointing(idx)) return null;

        return (
          <View
            key={`pointing-${pointing.id}`}
            className='rounded-[8px] border border-gray-400 shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)]'>
            <View className='flex-row items-center gap-[10px] rounded-t-[8px] bg-white px-[14px] pt-[14px]'>
              <Text className='text-16b text-black'>
                포인팅 <Text className='text-blue-600'>{pointing.label}</Text>
              </Text>
              <Text className='text-13m text-gray-700'>포인팅 질문</Text>
            </View>
            {pointing.questionContent && (
              <View className='gap-2 border-b border-gray-400 bg-white px-[14px]'>
                <ProblemViewer problemContent={pointing.questionContent} padding={16} />
              </View>
            )}
            {pointing.commentContent && (
              <View className='gap-2 rounded-b-[8px] bg-gray-100 px-[14px]'>
                <ProblemViewer
                  problemContent={pointing.commentContent}
                  minHeight={100}
                  padding={14}
                />
              </View>
            )}
          </View>
        );
      })}
    </>
  );
};
