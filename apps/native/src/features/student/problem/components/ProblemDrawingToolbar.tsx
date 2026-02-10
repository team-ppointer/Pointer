import React from 'react';
import { View } from 'react-native';
import { Undo2, Redo2 } from 'lucide-react-native';
import { PencilFilledIcon } from '@/components/system/icons';
import EraserFilledIcon from '@/components/system/icons/EraserFilledIcon';
import { colors, shadow } from '@/theme/tokens';
import { AnimatedPressable } from '@/components/common';

interface ProblemDrawingToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isEraserMode: boolean;
  onPenModePress: () => void;
  onEraserModePress: () => void;
}

export const ProblemDrawingToolbar = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isEraserMode,
  onPenModePress,
  onEraserModePress,
}: ProblemDrawingToolbarProps) => {
  return (
    <View className='gap-[10px] rounded-[10px] bg-gray-300 p-[8px]'>
      {/* Undo/Redo 그룹 */}
      <View className='gap-[10px]'>
        {/* Undo 버튼 */}
        <AnimatedPressable
          onPress={onUndo}
          disabled={!canUndo}
          className={`h-[36px] w-[36px] items-center justify-center rounded-lg ${
            canUndo ? 'bg-black' : 'bg-gray-100'
          }`}>
          <Undo2 size={16} color={canUndo ? '#fff' : colors['gray-500']} strokeWidth={1.33} />
        </AnimatedPressable>

        {/* Redo 버튼 */}
        <AnimatedPressable
          onPress={onRedo}
          disabled={!canRedo}
          className={`h-[36px] w-[36px] items-center justify-center rounded-lg ${
            canRedo ? 'bg-black' : 'bg-gray-100'
          }`}>
          <Redo2 size={16} color={canRedo ? '#fff' : colors['gray-500']} strokeWidth={1.33} />
        </AnimatedPressable>
      </View>

      {/* 구분선 */}
      <View className='h-[2px] w-[22px] self-center bg-gray-500' />

      {/* Pencil/Eraser 그룹 */}
      <View className='gap-[10px]'>
        {/* Eraser 버튼 */}
        <AnimatedPressable
          onPress={onEraserModePress}
          className='h-[36px] w-[36px] items-center justify-center rounded-lg border border-gray-500 bg-white'>
          <EraserFilledIcon
            size={16}
            color={isEraserMode ? colors['primary-500'] : colors['gray-700']}
          />
        </AnimatedPressable>

        {/* Pencil 버튼 */}
        <AnimatedPressable
          onPress={onPenModePress}
          className='h-[36px] w-[36px] items-center justify-center rounded-lg border border-gray-500 bg-white'>
          <PencilFilledIcon
            size={16}
            color={!isEraserMode ? colors['primary-500'] : colors['gray-700']}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
};
