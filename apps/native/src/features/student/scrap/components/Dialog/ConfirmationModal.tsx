import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { PopUpModal } from './ConfirmationDialog';

type ButtonVariant = 'default' | 'primary' | 'danger';

interface Button {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
}

export interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  buttons: [Button, Button];
}

const getButtonStyles = (variant: ButtonVariant = 'default') => {
  const baseStyles =
    'flex-1 items-center justify-center rounded-[12px] border border-gray-500 py-[12px]';

  switch (variant) {
    case 'primary':
      return `${baseStyles} bg-primary-500`;
    case 'danger':
      return `${baseStyles} bg-red-400`;
    case 'default':
    default:
      return `${baseStyles} bg-gray-300`;
  }
};

const getTextStyles = (variant: ButtonVariant = 'default') => {
  const baseStyles = 'text-18m';

  switch (variant) {
    case 'primary':
    case 'danger':
      return `${baseStyles} text-white`;
    case 'default':
    default:
      return `${baseStyles} text-[#1E1E21]`;
  }
};

export const ConfirmationModal = ({
  visible,
  onClose,
  title,
  description,
  buttons,
}: ConfirmationModalProps) => {
  return (
    <PopUpModal visibleState={visible} setVisibleState={onClose} className='px-2'>
      <View className='max-w-[458px] items-center justify-center gap-[24px] rounded-[12px] border border-[#DFE2E7] bg-white p-[28px] shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)]'>
        <View className='items-center gap-[12px]'>
          <Text className='text-18b text-[#1E1E1E]'>{title}</Text>
          {description && (
            <Text className='text-16m text-center text-[#1E1E1E]'>{description}</Text>
          )}
        </View>
        <View className='flex-row gap-[6px]'>
          {buttons.map((button, index) => (
            <Pressable
              key={index}
              className={getButtonStyles(button.variant)}
              onPress={button.onPress}>
              <Text className={getTextStyles(button.variant)}>{button.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </PopUpModal>
  );
};
