import { useScrapStore, useTrashStore } from '@/stores/scrapDataStore';
import { colors } from '@/theme/tokens';
import {
  Camera,
  FileSymlink,
  FolderOpen,
  ImagePlay,
  Trash2,
  Image,
  Images,
  FolderPlus,
  Undo2,
} from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View, Text, Pressable } from 'react-native';
import { showToast } from './Toast';
import React from 'react';
import Popover from 'react-native-popover-view';
import { ViewStyle } from 'react-native';
import { Placement } from 'react-native-popover-view/dist/Types';
import { ScrapListItemProps } from '../ScrapCard';
import { ScrapItem, TrashItem } from '@/types/test/types';
import { findItem } from '../../utils/itemHelpers';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentRootStackParamList } from '@/navigation/student/types';

interface TooltipPopoverProps {
  from: React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  placement?: Placement;
  popoverStyle?: ViewStyle;
}

const TooltipPopover = ({
  from,
  children,
  placement = Placement.AUTO,
  popoverStyle,
}: TooltipPopoverProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const close = () => {
    setIsVisible(false);
  };

  // from을 Pressable로 감싸서 클릭 시 열리도록 함
  const triggerElement = <Pressable onPress={() => setIsVisible(true)}>{from}</Pressable>;

  return (
    <Popover
      isVisible={isVisible}
      onRequestClose={close}
      from={triggerElement}
      placement={placement}
      animationConfig={{ duration: 0.1 }}
      popoverStyle={{
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors['gray-400'],
        shadowColor: '#0F0F12',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        ...popoverStyle,
      }}
      backgroundStyle={{ backgroundColor: 'transparent' }}>
      {typeof children === 'function' ? children(close) : children}
    </Popover>
  );
};

export default TooltipPopover;

export const ItemTooltipBox = ({
  props,
  onClose,
}: {
  props: ScrapListItemProps;
  onClose?: () => void;
}) => {
  const data = useScrapStore((state) => state.data);
  const updateItem = useScrapStore((state) => state.updateItem);
  const deleteItem = useScrapStore((state) => state.deleteItem);
  const addToTrash = useTrashStore((state) => state.addToTrash);
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  const item = findItem(data, props.id, props.type === 'SCRAP' ? props.parentFolderId : undefined);

  const [text, setText] = useState(item?.title ?? '');

  const handleClose = () => {
    onClose?.();
  };

  return (
    <View className='h-[176px] w-[228px] flex-col rounded-[10px] bg-white'>
      <View className='h-[44px] items-center justify-center gap-2 border-b-[0.5px] border-gray-500 px-[6px]'>
        <View className='h-[32px] w-[216px] rounded-[6px] bg-gray-300 px-[6px] py-1'>
          <TextInput
            className='text-16m items-center justify-center text-black'
            numberOfLines={1}
            value={text}
            onChangeText={setText}
            onEndEditing={() => {
              const trimmedText = text.trim();
              if (trimmedText.length > 0) {
                updateItem(
                  props.id,
                  trimmedText,
                  props.type === 'SCRAP' ? props.parentFolderId : undefined
                );
              }
            }}
          />
        </View>
      </View>
      <Pressable
        className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
        onPress={() => {
          handleClose();
          // Popover가 닫히는 시간을 주기 위해 약간의 지연
          setTimeout(() => {
            if (props.type === 'FOLDER') {
              navigation.push('ScrapContentList', { id: props.id });
            } else {
              // TODO: 스크랩 열기 기능 구현
              showToast('info', '스크랩 열기 기능은 준비 중입니다.');
            }
          }, 100);
        }}>
        <FolderOpen size={20} />
        {props.type === 'FOLDER' ? (
          <Text className='text-16r text-black'>폴더 열기</Text>
        ) : (
          <Text className='text-16r text-black'>스크랩 열기</Text>
        )}
      </Pressable>
      <View className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'>
        {props.type === 'FOLDER' ? (
          <>
            <ImagePlay size={20} />
            <Text className='text-16r text-black'>표지 변경하기</Text>
          </>
        ) : (
          <>
            <FileSymlink size={20} />
            <Text className='text-16r text-black'>폴더 이동하기</Text>
          </>
        )}
      </View>
      <Pressable
        className='flex-1 flex-row items-center gap-2 pl-4 pr-[26px]'
        onPress={async () => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 100));
            if (!item) {
              showToast('error', '아이템을 찾을 수 없습니다.');
              return;
            }

            const parentFolderId = item.type === 'SCRAP' ? item.parentFolderId : undefined;
            deleteItem(item.id, parentFolderId);
            addToTrash(item);
            handleClose();
            showToast('success', '휴지통으로 이동해 한 달 후 영구 삭제됩니다.');
          } catch (error) {
            showToast('error', '삭제 중 오류가 발생했습니다.');
          }
        }}>
        <Trash2 size={20} color={colors['red-400']} />
        <Text className='text-16r text-red-400'>휴지통으로 이동</Text>
      </Pressable>
    </View>
  );
};

export const AddItemTooltipBox = () => {
  return (
    <View className='h-[176px] w-[228px] flex-col rounded-[10px] bg-white'>
      <Pressable className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'>
        <Camera size={20} />
        <Text className='text-16r text-black'>사진 찍기</Text>
      </Pressable>
      <Pressable className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'>
        <Image size={20} />
        <Text className='text-16r text-black'>이미지 선택</Text>
      </Pressable>
      <Pressable className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'>
        <Images size={20} />
        <Text className='text-16r text-black'>QnA 사진 불러오기</Text>
      </Pressable>
      <Pressable className='flex-1 flex-row items-center gap-2 pl-4 pr-[26px]'>
        <FolderPlus size={20} />
        <Text className='text-16r text-black'>폴더 추가하기</Text>
      </Pressable>
    </View>
  );
};

export const ReviewItemTooltipBox = ({
  props,
  onClose,
}: {
  props: ScrapListItemProps;
  onClose?: () => void;
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  const handleClose = () => {
    onClose?.();
  };

  return (
    <View className='h-[88px] w-[228px] flex-col rounded-[10px] bg-white'>
      <View className='h-[44px] items-center justify-center gap-2 border-b-[0.5px] border-gray-500 px-[6px]'>
        <View className='h-[32px] w-[216px] rounded-[6px] bg-gray-300 px-[6px] py-1'>
          <Text className='text-16m items-center justify-center text-black opacity-40'>
            오답노트
          </Text>
        </View>
      </View>
      <Pressable
        className='flex-1 flex-row items-center gap-2 pl-4 pr-[26px]'
        onPress={() => {
          handleClose();
          // Popover가 닫히는 시간을 주기 위해 약간의 지연
          setTimeout(() => {
            navigation.push('ScrapContentList', { id: props.id });
          }, 100);
        }}>
        <FolderOpen size={20} />
        <Text className='text-16r text-black'>오답노트 열기</Text>
      </Pressable>
    </View>
  );
};

export const TrashItemTooltipBox = ({
  item,
  onClose,
  onDeletePress,
}: {
  item: TrashItem;
  onClose?: () => void;
  onDeletePress?: () => void;
}) => {
  const restoreFromTrash = useTrashStore((state) => state.restoreFromTrash);
  const restoreToScrap = useScrapStore((state) => state.restoreItem);

  const handleClose = () => {
    onClose?.();
  };

  return (
    <View className='h-[88px] w-[228px] flex-col rounded-[10px] bg-white'>
      <Pressable
        className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'
        onPress={async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (onDeletePress) {
            onDeletePress();
          } else {
            handleClose();
          }
        }}>
        <Trash2 size={20} color={colors['red-400']} />
        <Text className='text-16r text-red-400'>영구 삭제하기</Text>
      </Pressable>
      <Pressable
        className='flex-1 flex-row items-center gap-2 pl-4 pr-[26px]'
        onPress={async () => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 100));
            restoreToScrap(item);
            restoreFromTrash(item.id);
            handleClose();
            showToast('success', '선택된 파일이 복구되었습니다.');
          } catch (error) {
            showToast('error', '복구 중 오류가 발생했습니다.');
          }
        }}>
        <Undo2 size={20} />
        <Text className='text-16r text-black'>복구하기</Text>
      </Pressable>
    </View>
  );
};
