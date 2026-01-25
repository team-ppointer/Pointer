import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ChevronDownFilledIcon, ChevronUpFilledIcon } from '@/components/system/icons';
import { colors } from '@/theme/tokens';
import ProblemViewer from '../../../problem/components/ProblemViewer';
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
    <View className="w-full bg-white rounded-lg border border-gray-400 overflow-hidden">
      {/* Header */}
      <AnimatedPressable
        className="flex-row items-center justify-between px-3.5 py-2.5"
        onPress={toggleOpen}
        style={{ minHeight: 44 }}
        disableScale>
        <View className="flex-1 flex-row items-center justify-between">
          <Text className="text-16sb text-gray-800" numberOfLines={1}>
            {title}
          </Text>
          <View className="w-6 h-6 items-center justify-center">
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
        <View className="px-3.5 py-3.5 bg-gray-100">
          <ProblemViewer
            problemContent={explanation}
            minHeight={0}
            padding={0}
            fontStyle="serif"
          />
        </View>
      )}
    </View>
  );
};