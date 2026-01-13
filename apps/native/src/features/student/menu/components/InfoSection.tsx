import React from 'react';
import { View, Text } from 'react-native';
import { IconMenuItem } from './IconMenuItem';

interface InfoField {
  label: string;
  value: string;
  onPress?: () => void;
}

interface InfoSectionProps {
  icon: React.ReactNode;
  title: string;
  fields: InfoField[];
  showChevron?: boolean;
}

export const InfoSection = ({ icon, title, fields, showChevron = true }: InfoSectionProps) => {
  return (
    <View className='gap-[10px]'>
      <View className='flex-row items-center gap-[4px] mb-[6px]'>
        {icon}
        <Text className='text-18sb text-gray-900'>{title}</Text>
      </View>
      {fields.map((field, index) => (
        <View key={index} className='gap-[3px]'>
          <Text className='text-14m text-gray-900'>{field.label}</Text>
          <IconMenuItem title={field.value} onPress={field.onPress} showChevron={showChevron} />
        </View>
      ))}
    </View>
  );
};
