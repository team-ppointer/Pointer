import { Pressable, View, Text, Image } from 'react-native';
import React, { useState, useMemo } from 'react';
import { Check } from 'lucide-react-native';
import { ChevronDownFilledIcon } from '@/components/system/icons';
import { TooltipPopover, ItemTooltipBox } from '../../Tooltip';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { ScrapListItemProps } from '../types';
import { isItemSelected } from '../../../utils/reducer';
import { useNoteStore } from '@/stores/scrapNoteStore';
import { useRecentScrapStore } from '@/stores/recentScrapStore';
import { MoveScrapModal } from '../../Modal/MoveScrapModal';
import { colors } from '@/theme/tokens';
import { ImageWithSkeleton } from '@/components/common';

export const ScrapCard = (props: ScrapListItemProps) => {
  const state = props.reducerState ?? { isSelecting: false, selectedItems: [] };
  const isSelected = isItemSelected(state.selectedItems, props.id, props.type);
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const openNote = useNoteStore((state) => state.openNote);
  const addScrap = useRecentScrapStore((state) => state.addScrap);

  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);

  const imageSource = useMemo(
    () => (props.thumbnailUrl ? { uri: props.thumbnailUrl } : undefined),
    [props.thumbnailUrl]
  );

  const cardContent = (
    <View
      className={`h-full w-full items-center rounded-[10px] p-[10px] ${isSelected && 'bg-gray-300'}`}>
      <View className='gap-3'>
        <View className='items-center'>
          <ImageWithSkeleton
            source={imageSource}
            width='100%'
            aspectRatio={1}
            borderRadius={10}
            resizeMode='cover'
            uniqueId={`${props.type}-${props.id}`}
            fallback={<View className='aspect-square w-full rounded-[10px] bg-gray-600' />}
          />
          {state.isSelecting && (
            <Pressable
              onPress={props.onCheckPress}
              className={
                isSelected
                  ? 'absolute h-4 w-4 items-center justify-center rounded bg-blue-500'
                  : 'absolute h-4 w-4 items-center justify-center rounded border border-gray-700 bg-white'
              }
              style={{ bottom: 10 }}>
              <Check size={16} color='#F5F5F5' />
            </Pressable>
          )}
        </View>

        <View className='px-1'>
          <View className='flex-row justify-between'>
            <View className={'flex-[0.8] flex-row gap-0.5'}>
              <Text className='text-16sb  text-black' numberOfLines={1}>
                {props.name}
              </Text>
              {!state.isSelecting && (
                <View className='h-[24px] w-[24px]'>
                  <TooltipPopover
                    from={<ChevronDownFilledIcon color={colors['gray-700']} />}
                    children={(close) => (
                      <ItemTooltipBox
                        props={props}
                        onClose={close}
                        onMovePress={() => setIsMoveModalVisible(true)}
                      />
                    )}
                  />
                </View>
              )}
            </View>
            {props.type === 'FOLDER' && props.scrapCount !== undefined && (
              <Text className='text-12r text-blue-500'>{props.scrapCount}</Text>
            )}
          </View>
          <Text className='text-10r text-gray-700' numberOfLines={1}>
            {props.updatedAt
              ? new Date(props.updatedAt).toLocaleString('ko-kr')
              : new Date(props.createdAt).toLocaleString('ko-kr')}
          </Text>
        </View>
      </View>

      <MoveScrapModal
        visible={isMoveModalVisible}
        onClose={() => setIsMoveModalVisible(false)}
        selectedItems={[{ id: props.id, type: props.type }]}
        onSuccess={() => {}}
      />
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
          navigation.push('ScrapContent', { id: props.id });
        } else if (props.type === 'SCRAP') {
          openNote({ id: props.id, title: props.name });
          addScrap(props.id);
          navigation.push('ScrapContentDetail', { id: props.id });
        }
      }}>
      {cardContent}
    </Pressable>
  );
};
