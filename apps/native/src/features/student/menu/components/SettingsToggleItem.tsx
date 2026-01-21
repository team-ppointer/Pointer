import React from 'react';
import { View, Text, Switch } from 'react-native';
import { colors } from '@theme/tokens';

interface SettingsToggleItemProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const SettingsToggleItem = ({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}: SettingsToggleItemProps) => {
  return (
    <View className='flex-row items-center justify-between py-[4px]'>
      <View className='flex-1 gap-[2px]'>
        <Text className={`${description ? 'text-18m' : 'text-18sb'} text-gray-900`}>{title}</Text>
        {description && <Text className='text-14r text-gray-700'>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors['gray-400'], true: colors['blue-500'] }}
        thumbColor={'#FFFFFF'}
      />
    </View>
  );
};
