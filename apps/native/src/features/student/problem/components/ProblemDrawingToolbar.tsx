import React from 'react';
import { View } from 'react-native';
import { Undo2, Redo2 } from 'lucide-react-native';

import { PencilFilledIcon, EraserFilledIcon } from '@components/system/icons';
import { colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';

interface ProblemDrawingToolbarProps {
  isEraserMode: boolean;
  onPenModePress: () => void;
  onEraserModePress: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const ProblemDrawingToolbar = ({
  isEraserMode,
  onPenModePress,
  onEraserModePress,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
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

      {/* 구분선 */}
      <View className='h-[2px] w-[22px] self-center bg-gray-500' />

      {/* Undo/Redo 그룹 */}
      <View className='gap-[6px]'>
        <AnimatedPressable
          onPress={onUndo}
          disabled={!canUndo}
          className='size-[36px] items-center justify-center rounded-lg border border-gray-500 bg-white'>
          <Undo2
            size={16}
            color={canUndo ? colors['gray-900'] : colors['gray-500']}
          />
        </AnimatedPressable>
        <AnimatedPressable
          onPress={onRedo}
          disabled={!canRedo}
          className='size-[36px] items-center justify-center rounded-lg border border-gray-500 bg-white'>
          <Redo2
            size={16}
            color={canRedo ? colors['gray-900'] : colors['gray-500']}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
};
