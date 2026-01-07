import React from 'react';
import { View } from 'react-native';
import { Undo2, Redo2, Type } from 'lucide-react-native';
import { colors } from '@/theme/tokens';
import { IconButton } from '../../../problem/components/WritingArea';
import { PencilFilledIcon } from '@/components/system/icons';
import EraserFilledIcon from '@/components/system/icons/EraserFilledIcon';
import { SizeSelector } from '@/features/student/scrap/components/scrap/SizeSelector';

export interface DrawingToolbarProps {
  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;

  // Mode selection
  isEraserMode: boolean;
  isTextMode: boolean;
  onPenModePress: () => void;
  onEraserModePress: () => void;
  onTextModePress: () => void;

  // Size selection
  strokeWidth: number;
  eraserSize: number;
  onStrokeWidthChange: (size: number) => void;
  onEraserSizeChange: (size: number) => void;
}

const STROKE_SIZES = [2, 1.2, 0.7];
const ERASER_SIZES = [22, 14, 8];

export const DrawingToolbar = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isEraserMode,
  isTextMode,
  onPenModePress,
  onEraserModePress,
  onTextModePress,
  strokeWidth,
  eraserSize,
  onStrokeWidthChange,
  onEraserSizeChange,
}: DrawingToolbarProps) => {
  return (
    <View className='flex-row items-center gap-[10px] border-b border-gray-400 bg-gray-100 px-[14px] py-[6px]'>
      {/* Undo/Redo */}
      <View className='flex-row items-center gap-[10px]'>
        <IconButton
          icon={Undo2}
          backgroundColor='bg-gray-700'
          disabledBackgroundColor='bg-gray-100'
          iconColor='white'
          onPress={onUndo}
          disabled={!canUndo}
          disabledColor={colors['gray-500']}
          radius={8}
          size={36}
        />
        <IconButton
          icon={Redo2}
          backgroundColor='bg-gray-700'
          disabledBackgroundColor='bg-gray-100'
          iconColor='white'
          onPress={onRedo}
          disabled={!canRedo}
          disabledColor={colors['gray-500']}
          size={36}
          radius={8}
        />
      </View>

      <View className='h-[22px] w-[2px] bg-gray-500' />

      {/* Mode Selection */}
      <View className='flex-row items-center gap-[10px]'>
        <IconButton
          icon={PencilFilledIcon}
          disabled={isTextMode || isEraserMode}
          backgroundColor='bg-blue-200'
          disabledBackgroundColor='bg-gray-100'
          iconColor={colors['primary-500']}
          disabledColor={colors['gray-700']}
          onPress={onPenModePress}
          size={36}
          radius={8}
        />
        <IconButton
          icon={EraserFilledIcon}
          disabled={!isEraserMode}
          backgroundColor='bg-blue-200'
          disabledBackgroundColor='bg-gray-100'
          iconColor={colors['primary-500']}
          disabledColor={colors['gray-700']}
          onPress={onEraserModePress}
          size={36}
          radius={8}
        />
        <IconButton
          icon={Type}
          disabled={!isTextMode}
          backgroundColor='bg-blue-200'
          disabledBackgroundColor='bg-gray-100'
          iconColor={colors['primary-500']}
          disabledColor={colors['gray-700']}
          onPress={onTextModePress}
          size={36}
          radius={8}
        />
      </View>

      <View className='h-[22px] w-[2px] bg-gray-500' />

      {/* Size Selection */}
      <View className='flex-row items-center gap-[10px]'>
        {!isTextMode && !isEraserMode && (
          <SizeSelector
            type='stroke'
            sizes={STROKE_SIZES}
            selectedSize={strokeWidth}
            onSizeChange={onStrokeWidthChange}
          />
        )}

        {isEraserMode && (
          <SizeSelector
            type='eraser'
            sizes={ERASER_SIZES}
            selectedSize={eraserSize}
            onSizeChange={onEraserSizeChange}
          />
        )}
      </View>
    </View>
  );
};
