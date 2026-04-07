import React from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@theme/tokens';

interface SearchHeaderProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  placeholder?: string;
}

const SearchHeader = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = '검색어를 입력해주세요.',
}: SearchHeaderProps) => {
  const insets = useSafeAreaInsets();

  const handleClear = () => {
    onChange('');
  };

  return (
    <View
      className='flex-row items-center gap-[12px] border-b border-gray-300 bg-white px-[16px] pb-[12px]'
      style={{ paddingTop: insets.top + 12 }}>
      {/* Search Input */}
      <View className='flex-1 flex-row items-center rounded-[8px] bg-gray-200 px-[12px] py-[10px]'>
        <TextInput
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors['gray-600']}
          returnKeyType='search'
          autoFocus
          className='text-14r flex-1 text-gray-900'
          style={{ paddingTop: 0, paddingBottom: 0 }}
        />
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            className='ml-[8px] size-[24px] items-center justify-center rounded-full bg-gray-400 active:bg-gray-500'>
            <X size={14} color='white' />
          </Pressable>
        )}
      </View>

      {/* Cancel Button */}
      <Pressable onPress={onCancel} className='py-[8px]'>
        <Text className='text-14m text-gray-800'>취소</Text>
      </Pressable>
    </View>
  );
};

export default SearchHeader;
