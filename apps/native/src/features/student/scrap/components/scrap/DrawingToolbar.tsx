import React from 'react';
import { View } from 'react-native';
import { Type, Undo2, Redo2 } from 'lucide-react-native';

import { colors } from '@theme/tokens';
import { PencilFilledIcon, EraserFilledIcon } from '@components/system/icons';
import { SizeSelector } from '@features/student/scrap/components/scrap/SizeSelector';

import { IconButton } from '../../../problem/components/WritingArea';

export interface DrawingToolbarProps {
  // Mode selection
  isEraserMode: boolean;
  isTextBoxMode: boolean;
  onPenModePress: () => void;
  onEraserModePress: () => void;
  onTextBoxModePress: () => void;

  // Size selection
  strokeWidth: number;
  eraserSize: number;
  onStrokeWidthChange: (size: number) => void;
  onEraserSizeChange: (size: number) => void;

  // Undo/Redo
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo: () => void;
  onRedo: () => void;

  // Narrow layout flag (drawingAreaWidth < 380)
  isNarrow?: boolean;
}

const STROKE_SIZES = [2, 1.2, 0.7];
const ERASER_SIZES = [22, 14, 8];

export const DrawingToolbar = ({
  isEraserMode,
  isTextBoxMode,
  onPenModePress,
  onEraserModePress,
  onTextBoxModePress,
  strokeWidth,
  eraserSize,
  onStrokeWidthChange,
  onEraserSizeChange,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isNarrow = false,
}: DrawingToolbarProps) => {
  const SizeSelectorComponent = (
    <View
      pointerEvents={isTextBoxMode ? 'none' : 'auto'}
      style={{ opacity: isTextBoxMode ? 0 : 1 }}>
      {isEraserMode ? (
        <SizeSelector
          type='eraser'
          sizes={ERASER_SIZES}
          selectedSize={eraserSize}
          onSizeChange={onEraserSizeChange}
        />
      ) : (
        <SizeSelector
          type='stroke'
          sizes={STROKE_SIZES}
          selectedSize={strokeWidth}
          onSizeChange={onStrokeWidthChange}
        />
      )}
    </View>
  );

  return (
    <View className='border-b border-gray-400 bg-gray-100'>
      {/* 첫 번째 줄 */}
      <View
        className='flex-row items-center gap-[10px] px-[14px] py-[6px]'
        style={{ borderBottomWidth: isNarrow ? 1 : 0, borderColor: '#DFE2E7' }}>
        {/* Mode Selection */}
        <View className='flex-row items-center gap-[10px]'>
          <IconButton
            icon={PencilFilledIcon}
            disabled={isTextBoxMode || isEraserMode}
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
            disabled={!isTextBoxMode}
            backgroundColor='bg-blue-200'
            disabledBackgroundColor='bg-gray-100'
            iconColor={colors['primary-500']}
            disabledColor={colors['gray-700']}
            onPress={onTextBoxModePress}
            size={36}
            radius={8}
          />
        </View>

        <View className='h-[22px] w-[2px] bg-gray-500' />

        {/* Undo/Redo */}
        <View className='flex-row items-center gap-[6px]'>
          <IconButton
            icon={Undo2}
            disabled={!canUndo}
            backgroundColor='bg-gray-100'
            disabledBackgroundColor='bg-gray-100'
            iconColor={colors['gray-900']}
            disabledColor={colors['gray-500']}
            onPress={onUndo}
            size={36}
            radius={8}
          />
          <IconButton
            icon={Redo2}
            disabled={!canRedo}
            backgroundColor='bg-gray-100'
            disabledBackgroundColor='bg-gray-100'
            iconColor={colors['gray-900']}
            disabledColor={colors['gray-500']}
            onPress={onRedo}
            size={36}
            radius={8}
          />
        </View>

        {!isNarrow && <View className='h-[22px] w-[2px] bg-gray-500' />}

        {/* Size Selection - 너비가 380 이상일 때만 첫 번째 줄에 표시 */}
        {!isNarrow && (
          <View className='flex-row items-center gap-[10px] px-[14px] py-[6px]'>
            {SizeSelectorComponent}
          </View>
        )}
      </View>

      {/* 두 번째 줄 - 너비가 380보다 낮을 때만 표시 */}
      {isNarrow && (
        <View className='flex-row items-center gap-[10px] px-[14px] py-[6px]'>
          {SizeSelectorComponent}
        </View>
      )}
    </View>
  );
};
