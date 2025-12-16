import { Pressable, View, Text } from 'react-native';
import { Action, State } from '../utils/reducer';
import React, { useState } from 'react';
import { Check } from 'lucide-react-native';
import { ChevronDownFilledIcon } from '@/components/system/icons';
import TooltipPopover, { ItemTooltipBox, TrashItemTooltipBox } from './Modal/TooltipBox';
import { TrashItem, ScrapItem } from '@/types/test/types';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import PopUpModal from './Modal/PopupModal';
import { useTrashStore } from '@/stores/scrapDataStore';
import { showToast } from './Modal/Toast';

export interface BaseItemUIProps {
  id: string;
  title: string;
  timestamp: string;
}

export interface SelectableUIProps {
  reducerState?: State;
  dispatch?: React.Dispatch<Action>;
  onCheckPress?: () => void;
}

export interface ScrapCardProps extends BaseItemUIProps, SelectableUIProps {
  type: 'SCRAP';
  parentFolderName?: string;
  parentFolderId?: string;
}

export interface FolderCardProps extends BaseItemUIProps, SelectableUIProps {
  type: 'FOLDER';
  contents: ScrapItem[]; // 실제 데이터 구조와 일치: 폴더와 스크랩 모두 포함
}

export interface ReviewFolderCardProps extends FolderCardProps {
  id: 'REVIEW';
}

export type ScrapListItemProps = ScrapCardProps | FolderCardProps | ReviewFolderCardProps;

export const ScrapCard = (props: ScrapListItemProps) => {
  const state = props.reducerState ?? { isSelecting: false, selectedItems: [] };
  const isSelected = state.selectedItems.includes(props.id);
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  return (
    <Pressable
      className={`w-full items-center gap-3 rounded-[10px] p-[10px]`}
      onPress={() => {
        if (state.isSelecting) return;

        if (props.type === 'FOLDER') navigation.push('ScrapContent', { id: props.id });
      }}>
      <View className='h-[145.5px] w-[145.5px] rounded-[10px] bg-gray-600' />

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
          <View className='flex-row gap-0.5'>
            <Text className='text-16sb text-[#1E1E21]' numberOfLines={2}>
              {props.title}
            </Text>
            {!state.isSelecting && (
              <TooltipPopover
                from={<ChevronDownFilledIcon />}
                children={(close) => <ItemTooltipBox props={props} onClose={close} />}
              />
            )}
          </View>
          {props.type === 'FOLDER' && (
            <Text className='text-12m text-gray-700'>{props.contents.length}</Text>
          )}
        </View>

        <Text className='text-10r text-gray-700'>{props.timestamp}</Text>
      </View>
    </Pressable>
  );
};

export interface SearchResultCardProps {
  item: ScrapItem;
  parentFolderName?: string;
}

export const SearchResultCard = ({ item, parentFolderName }: SearchResultCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  return (
    <Pressable
      className='w-full items-center gap-3 rounded-[10px] p-[10px]'
      onPress={() => {
        if (item.type === 'FOLDER') navigation.push('ScrapContent', { id: item.id });
      }}>
      <View className='h-[145.5px] w-[145.5px] rounded-[10px] bg-gray-600' />

      <View className='w-full px-[6px]'>
        {parentFolderName && (
          <Text className='text-12m text-black' numberOfLines={1}>
            {parentFolderName}
          </Text>
        )}

        <View className='flex-row justify-between'>
          <Text className='text-16sb text-[#1E1E21]' numberOfLines={2}>
            {item.title}
          </Text>

          {item.type === 'FOLDER' && (
            <Text className='text-12m text-gray-800'>{item.contents.length}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export interface TrashCardProps extends SelectableUIProps {
  item: TrashItem;
}

export const TrashCard = ({ item, reducerState, onCheckPress }: TrashCardProps) => {
  const state = reducerState ?? { isSelecting: false, selectedItems: [] };
  const isSelected = state.selectedItems.includes(item.id);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const deleteForever = useTrashStore((state) => state.deleteForever);

  return (
    <>
      <TooltipPopover
        from={
          <View className='w-full items-center gap-3 rounded-[10px] p-[10px]'>
            <View className='h-[145.5px] w-[145.5px] rounded-[10px] bg-gray-600' />
            {state.isSelecting && (
              <Pressable
                onPress={onCheckPress}
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
              <Text className='text-16sb text-[#1E1E21]' numberOfLines={2}>
                {item.title}
              </Text>
              <Text className='text-12m text-gray-800'>
                {new Date(item.deletedAt).toLocaleString()}
              </Text>
            </View>
          </View>
        }
        children={
          !state.isSelecting
            ? (close) => (
                <TrashItemTooltipBox
                  item={item}
                  onClose={close}
                  onDeletePress={() => {
                    close();
                    setTimeout(() => {
                      setIsDeleteModalVisible(true);
                    }, 200);
                  }}
                />
              )
            : undefined
        }
      />
      <PopUpModal
        visibleState={isDeleteModalVisible}
        setVisibleState={setIsDeleteModalVisible}
        className='px-[60px] py-[65px]'>
        <View className='w-[458px] max-w-[600px] items-center justify-center gap-[24px] rounded-[12px] border border-[#DFE2E7] bg-white p-[28px] shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)]'>
          <View className='items-center gap-[12px]'>
            <Text className='text-18b text-[#1E1E1E]'>스크랩을 영구적으로 삭제합니다.</Text>
            <Text className='text-16m text-[#1E1E1E]'>되돌릴 수 없는 작업입니다.</Text>
          </View>
          <View className='flex-row gap-[6px]'>
            <Pressable
              className='flex-1 items-center justify-center rounded-[12px] border border-gray-500 bg-gray-300 py-[12px]'
              onPress={() => setIsDeleteModalVisible(false)}>
              <Text className='text-18m text-[#1E1E21]'>취소</Text>
            </Pressable>
            <Pressable
              className='flex-1 items-center justify-center rounded-[12px] border border-gray-500 bg-red-400 py-[12px]'
              onPress={async () => {
                try {
                  await new Promise((resolve) => setTimeout(resolve, 100));
                  deleteForever(item.id);
                  setIsDeleteModalVisible(false);
                  showToast('success', '영구 삭제되었습니다.');
                } catch (error) {
                  showToast('error', '삭제 중 오류가 발생했습니다.');
                }
              }}>
              <Text className='text-18m text-white'>삭제하기</Text>
            </Pressable>
          </View>
        </View>
      </PopUpModal>
    </>
  );
};
