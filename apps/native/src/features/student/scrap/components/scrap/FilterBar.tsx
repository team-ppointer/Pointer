import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Bookmark, ChevronRight } from 'lucide-react-native';
import { TextButton } from '@/components/common';
import { colors } from '@/theme/tokens';

export interface FilterBarProps {
  filterOptions: string[];
  selectedFilter: number;
  onFilterChange: (index: number) => void;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export const FilterBar = ({
  filterOptions,
  selectedFilter,
  onFilterChange,
  showViewAll = false,
  onViewAll,
}: FilterBarProps) => {
  const [isScrollEnd, setIsScrollEnd] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 1;
    setIsScrollEnd(isEnd);
  };

  return (
    <View className='flex-row items-center justify-center gap-2'>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexDirection: 'row', gap: 10 }}>
        {filterOptions.map((option, index) => (
          <View key={option} className='flex-row items-center gap-2'>
            <TextButton
              variant='blue'
              onPress={() => onFilterChange(index)}
              style={{
                backgroundColor: selectedFilter === index ? colors['primary-500'] : '#D9E2FF',
                alignItems: 'center',
                justifyContent: 'center',
                height: 34,
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 6,
              }}>
              <View className='flex-row items-center gap-1'>
                {index !== 0 && (
                  <Bookmark
                    size={16}
                    color={selectedFilter === index ? '#FFF' : colors['primary-500']}
                    fill={selectedFilter === index ? '#FFF' : colors['primary-500']}
                  />
                )}
                <Text
                  className={
                    selectedFilter === index ? 'text-16m text-white' : 'text-16m text-gray-800'
                  }>
                  {option}
                </Text>
              </View>
            </TextButton>
          </View>
        ))}
      </ScrollView>
      {showViewAll && (
        <View className='pl-[6px] pr-[8px]'>
          <Pressable className='flex-row items-center gap-0.5' onPress={onViewAll}>
            {/* <Text className='text-16m text-gray-800'>전체보기</Text> */}
            <ChevronRight size={16} color={colors['gray-700']} opacity={isScrollEnd ? 0.3 : 1} />
          </Pressable>
        </View>
      )}
    </View>
  );
};
