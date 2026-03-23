import React, { useState } from 'react';
import { View, Text } from 'react-native';

import ProblemViewer from '../../../problem/components/ProblemViewer';

import { ChevronDownFilledIcon, ChevronUpFilledIcon } from '@/components/system/icons';
import { colors } from '@/theme/tokens';
import { AnimatedPressable } from '@/components/common';

export interface ExplanationSectionProps {
  explanation: string;
  title?: string;
  defaultOpen?: boolean;
}

export const ExplanationSection = ({
  explanation,
  title = '해설',
  defaultOpen = false,
}: ExplanationSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <View className='w-full overflow-hidden rounded-lg border border-gray-400 bg-white'>
      {/* Header */}
      <AnimatedPressable
        className='flex-row items-center justify-between px-3.5 py-2.5'
        onPress={toggleOpen}
        style={{ minHeight: 44 }}
        disableScale>
        <View className='flex-1 flex-row items-center justify-between'>
          <Text className='text-16sb text-gray-800' numberOfLines={1}>
            {title}
          </Text>
          <View className='h-6 w-6 items-center justify-center'>
            {isOpen ? (
              <ChevronUpFilledIcon size={20} color={colors['gray-800']} />
            ) : (
              <ChevronDownFilledIcon size={20} color={colors['gray-800']} />
            )}
          </View>
        </View>
      </AnimatedPressable>

      {/* Content */}
      {isOpen && (
        <View className='bg-gray-100 px-3.5 py-3.5'>
          <ProblemViewer
            problemContent={explanation}
            minHeight={0}
            padding={16}
            fontStyle='serif'
          />
        </View>
      )}
    </View>
  );
};
