import { Pressable, View, Text } from 'react-native';
import { Action, State } from '../utils/reducer';
import React from 'react';
import { Check } from 'lucide-react-native';
import { ChevronDownFilledIcon } from '@/components/system/icons';

interface FolderOverrides {
  type: 'Folder';
  amount: number;
}

interface ScrapOverrides {
  type: 'Scrap';
  timestamp: string;
}

interface BaseItemProps {
  id: string;
  title: string;
  ruducerState: State;
  onItemPress?: () => void;
  onDownPress?: () => void;
  onCheckPress?: () => void;
  className?: string;
}

export type ItemProps = BaseItemProps & (FolderOverrides | ScrapOverrides);

const ScrapItem = (props: ItemProps) => {
  const isSelected = props.ruducerState.selectedItems.includes(props.id);
  return (
    <Pressable
      className={`w-full items-center gap-3 rounded-[10px] p-[10px] ${props.className}`}
      onPress={props.onItemPress}>
      <View className='h-[145.5px] w-[145.5px] items-center rounded-[10px] bg-gray-600' />
      {props.ruducerState.isSelecting && (
        <Pressable
          onPress={props.onCheckPress}
          className={
            isSelected
              ? 'absolute h-4 w-4 items-center justify-center rounded-[4px] bg-blue-500'
              : 'absolute h-4 w-4 items-center justify-center rounded-[4px] border border-gray-700 bg-white'
          }
          style={{
            left: 20,
            top: 50,
          }}>
          {props.ruducerState.isSelecting && <Check size={16} color={'#F5F5F5'} />}
        </Pressable>
      )}

      <View
        className={`min-w-[136px] flex-1  flex-${props.type === 'Folder' ? 'row' : 'col'} items-start justify-between px-[6px]`}>
        <View className='flex-row items-center gap-0.5'>
          <Text className='text-16sb text-[#1E1E21]'>{props.title}</Text>
          {!props.ruducerState.isSelecting && (
            <Pressable onPress={props.onDownPress}>
              <ChevronDownFilledIcon />
            </Pressable>
          )}
        </View>
        {props.type === 'Folder' && <Text className='text-12m text-gray-700'>{props.amount}</Text>}
        {props.type === 'Scrap' && (
          <Text className='text-10r text-gray-700'>{props.timestamp}</Text>
        )}
      </View>
    </Pressable>
  );
};

export default ScrapItem;
