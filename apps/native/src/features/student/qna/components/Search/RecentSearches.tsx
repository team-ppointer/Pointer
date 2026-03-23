import React from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

import { colors } from '@theme/tokens';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (search: string) => void;
  onRemove: (search: string) => void;
  onClearAll: () => void;
}

const SearchTag = ({
  text,
  onPress,
  onRemove,
}: {
  text: string;
  onPress: () => void;
  onRemove: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className='mr-[8px] flex-row items-center gap-[6px] rounded-full bg-gray-200 px-[12px] py-[8px] active:bg-gray-300'>
    <Text className='text-14r text-gray-800'>{text}</Text>
    <Pressable
      onPress={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <X size={14} color={colors['gray-600']} />
    </Pressable>
  </Pressable>
);

const RecentSearches = ({ searches, onSelect, onRemove, onClearAll }: RecentSearchesProps) => {
  if (searches.length === 0) {
    return null;
  }

  return (
    <View className='py-[16px]'>
      {/* Header */}
      <View className='flex-row items-center justify-between px-[24px] pb-[12px]'>
        <Text className='text-16sb text-gray-900'>최근 검색어</Text>
        <Pressable onPress={onClearAll}>
          <Text className='text-14m text-primary-500'>전체 지우기</Text>
        </Pressable>
      </View>

      {/* Tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}>
        {searches.map((search, index) => (
          <SearchTag
            key={`${search}-${index}`}
            text={search}
            onPress={() => onSelect(search)}
            onRemove={() => onRemove(search)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default RecentSearches;
