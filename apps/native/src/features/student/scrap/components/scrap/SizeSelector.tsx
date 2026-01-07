import React from 'react';
import { View, Pressable } from 'react-native';

export type SizeSelectorType = 'stroke' | 'eraser';

export interface SizeSelectorProps {
  type: SizeSelectorType;
  sizes: number[];
  selectedSize: number;
  onSizeChange: (size: number) => void;
}

export const SizeSelector = ({ type, sizes, selectedSize, onSizeChange }: SizeSelectorProps) => {
  return (
    <View className='flex-row items-center gap-2'>
      {sizes.map((size) => (
        <Pressable
          key={size}
          onPress={() => onSizeChange(size)}
          className={`h-[36px] w-[36px] items-center justify-center rounded-[8px] p-[5.6px] ${
            selectedSize === size ? 'bg-gray-400' : 'bg-gray-100'
          }`}>
          {type === 'stroke' && <View className='w-[22px] bg-black' style={{ height: size }} />}
          {type === 'eraser' && (
            <View
              className='border-primary-500 rounded-full border-[2px] bg-white'
              style={{ width: size, height: size }}
            />
          )}
        </Pressable>
      ))}
    </View>
  );
};
