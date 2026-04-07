import React from 'react';
import { View } from 'react-native';

import { PencilFilledIcon, EraserFilledIcon } from '@components/system/icons';
import { colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';

interface ProblemDrawingToolbarProps {
  isEraserMode: boolean;
  onPenModePress: () => void;
  onEraserModePress: () => void;
}

export const ProblemDrawingToolbar = ({
  isEraserMode,
  onPenModePress,
  onEraserModePress,
}: ProblemDrawingToolbarProps) => {
  return (
    <View className='gap-[10px] rounded-[10px] bg-gray-300 p-[8px]'>
      {/* Pencil/Eraser 그룹 */}
      <View className='gap-[10px]'>
        {/* Eraser 버튼 */}
        <AnimatedPressable
          onPress={onEraserModePress}
          className='size-[36px] items-center justify-center rounded-lg border border-gray-500 bg-white'>
          <EraserFilledIcon
            size={16}
            color={isEraserMode ? colors['primary-500'] : colors['gray-700']}
          />
        </AnimatedPressable>

        {/* Pencil 버튼 */}
        <AnimatedPressable
          onPress={onPenModePress}
          className='size-[36px] items-center justify-center rounded-lg border border-gray-500 bg-white'>
          <PencilFilledIcon
            size={16}
            color={!isEraserMode ? colors['primary-500'] : colors['gray-700']}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
};
