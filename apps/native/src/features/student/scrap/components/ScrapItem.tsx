import { Pressable, View, Text } from 'react-native';
import { Action, State } from '../utils/reducer';
import React from 'react';
import { Check } from 'lucide-react-native';
import { ChevronDownFilledIcon } from '@/components/system/icons';
import TooltipPopover, { ItemTooltipBox } from './Modal/TooltipBox';
import { DummyItem } from './ScrapItemGrid';

interface BaseItemProps {
  id: string;
  title: string;
  timestamp: string; // 여기서 string/number 결정
}

interface FolderItemProps extends BaseItemProps, OptionalItemProps {
  type: 'FOLDER';
  amount: number;
  contents: ScrapItemProps[];
}

interface ScrapItemProps extends BaseItemProps, OptionalItemProps {
  type: 'SCRAP';
  parentFolderName?: string;
}

interface ReviewFolderProps extends FolderItemProps {
  id: 'REVIEW';
}

interface OptionalItemProps {
  ruducerState?: State;
  dispatch?: React.Dispatch<Action>;
  onItemPress?: () => void;
  onDownPress?: () => void;
  onCheckPress?: () => void;
  className?: string;
}

export type ItemProps = ScrapItemProps | FolderItemProps | ReviewFolderProps;

export const ScrapItem = (props: ItemProps) => {
  const state = props.ruducerState ?? { isSelecting: false, selectedItems: [] };
  const isSelected = state ? state.selectedItems.includes(props.id) : false;

  return (
    <Pressable
      className={`w-full items-center gap-3 rounded-[10px] p-[10px] ${props.className}`}
      onPress={props.onItemPress}>
      <View className='h-[145.5px] w-[145.5px] items-center rounded-[10px] bg-gray-600' />
      {state.isSelecting && (
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
          {state.isSelecting && <Check size={16} color={'#F5F5F5'} />}
        </Pressable>
      )}

      <View className={`w-full flex-col px-[6px]`}>
        <View className='flex-row items-center justify-between'>
          <View className='flex-[0.8] flex-row gap-0.5'>
            <Text className='text-16sb text-[#1E1E21]' numberOfLines={2} ellipsizeMode='tail'>
              {props.title}
            </Text>
            {!state.isSelecting && (
              <TooltipPopover
                children={<ItemTooltipBox props={props} />}
                from={<ChevronDownFilledIcon />}
              />
            )}
          </View>
          {props.type === 'FOLDER' && (
            <Text className='text-12m text-gray-700'>{props.amount}</Text>
          )}
        </View>
        <Text className='text-10r text-gray-700'>{props.timestamp}</Text>
      </View>
    </Pressable>
  );
};

export interface SearchResultItem {
  scrap: DummyItem; // 실제 스크랩 아이템
  parentFolderName?: string; // 속한 폴더가 있으면 이름
}

export const ResultScrapItem = (props: SearchResultItem) => {
  return (
    <Pressable className={`w-full items-center gap-3 rounded-[10px] p-[10px]`}>
      <View className='h-[145.5px] w-[145.5px] items-center rounded-[10px] bg-gray-600' />
      <View className={`w-full flex-col px-[6px]`}>
        <View className='flex-col items-start justify-between'>
          {props.parentFolderName && (
            <Text className='text-12m text-black' numberOfLines={1} ellipsizeMode='tail'>
              {props.parentFolderName}
            </Text>
          )}
          <Text className='text-16sb text-[#1E1E21]' numberOfLines={2} ellipsizeMode='tail'>
            {props.scrap.title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
