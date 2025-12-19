import { Pressable, View, Text, Image } from 'react-native';
import React from 'react';
import { Check } from 'lucide-react-native';
import { ChevronDownFilledIcon } from '@/components/system/icons';
import { TooltipPopover, ItemTooltipBox } from '../../Modal/Tooltip';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { ScrapListItemProps } from '../types';
import { isItemSelected } from '../../../utils/reducer';
import { useNoteStore, Note } from '@/stores/scrapNoteStore';

export const ScrapCard = (props: ScrapListItemProps) => {
  const state = props.reducerState ?? { isSelecting: false, selectedItems: [] };
  const isSelected = isItemSelected(state.selectedItems, props.id, props.type);
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const openNote = useNoteStore((state) => state.openNote);

  const thumbnailUrl = props.type === 'SCRAP' ? props.thumbnailUrl : undefined;

  const cardContent = (
    <View className='w-full items-center gap-3 rounded-[10px] p-[10px]'>
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          className='h-[145.5px] w-[145.5px] rounded-[10px]'
          resizeMode='cover'
        />
      ) : (
        <View className='h-[145.5px] w-[145.5px] rounded-[10px] bg-gray-600' />
      )}

      {state.isSelecting && (
        <Pressable
          onPress={props.onCheckPress}
          className={
            isSelected
              ? 'absolute h-4 w-4 items-center justify-center rounded bg-blue-500'
              : 'absolute h-4 w-4 items-center justify-center rounded border border-gray-700 bg-white'
          }
          style={{ left: 20, top: 50 }}>
          <Check size={16} color='#F5F5F5' />
        </Pressable>
      )}

      <View className='w-full px-[6px]'>
        <View className='flex-row justify-between'>
          <View className='flex-[0.9] flex-row gap-0.5'>
            <Text className='text-16sb text-[#1E1E21]' numberOfLines={2}>
              {props.name}
            </Text>
            {!state.isSelecting && (
              <TooltipPopover
                from={<ChevronDownFilledIcon />}
                children={(close) => <ItemTooltipBox props={props} onClose={close} />}
              />
            )}
          </View>
          {props.type === 'FOLDER' && props.scrapCount !== undefined && (
            <Text className='text-12m text-gray-700'>{props.scrapCount}</Text>
          )}
        </View>

        <Text className='text-10r text-gray-700'>
          {new Date(props.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <Pressable
      onPress={() => {
        if (state.isSelecting) {
          props.onCheckPress?.();
          return;
        }

        if (props.type === 'FOLDER') {
          navigation.push('ScrapContent', { id: String(props.id) });
        } else if (props.type === 'SCRAP') {
          openNote({ id: props.id, title: props.name });
          navigation.push('ScrapContentDetail', { id: String(props.id) });
        }
      }}>
      {cardContent}
    </Pressable>
  );
};
