import { useScrapStore } from '@/stores/scrapDataStore';
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
} from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View, Text, Pressable } from 'react-native';
import { ItemProps } from '../ScrapItem';
import { showToast } from './Toast';
import React from 'react';
import Popover from 'react-native-popover-view';
import { ViewStyle } from 'react-native';
import { Placement } from 'react-native-popover-view/dist/Types';

interface TooltipPopoverProps {
  from: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  popoverStyle?: ViewStyle;
}

const TooltipPopover = ({
  from,
  children,
  placement = Placement.AUTO,
  popoverStyle,
}: TooltipPopoverProps) => {
  return (
    <Popover
      from={from}
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
      {children}
    </Popover>
  );
};

export default TooltipPopover;

export const ItemTooltipBox = ({ props }: { props: ItemProps }) => {
  const data = useScrapStore((state) => state.data);
  const updateItem = useScrapStore((state) => state.updateItem);
  const deleteItem = useScrapStore((state) => state.deleteItem);

  const item = data.find((i) => i.id === props.id);

  const [text, setText] = useState(item?.title ?? '');

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
              if (text.length > 0) updateItem(props.id, text);
            }}
          />
        </View>
      </View>
      <View className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'>
        <FolderOpen size={20} />
        {props.type === 'Folder' ? (
          <Text className='text-16r text-black'>폴더 열기</Text>
        ) : (
          <Text className='text-16r text-black'>스크랩 열기</Text>
        )}
      </View>
      <View className='flex-1 flex-row items-center gap-2 border-b-[0.5px] border-gray-500 pl-4 pr-[26px]'>
        {props.type === 'Folder' ? (
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
            deleteItem(props.id);
          } finally {
            showToast('success', '휴지통으로 이동해 한 달 후 영구 삭제됩니다.');
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

export const ReviewItemTooltipBox = ({ props }: { props: ItemProps }) => {
  const data = useScrapStore((state) => state.data);
  const updateItem = useScrapStore((state) => state.updateItem);
  const item = data.find((i) => i.id === props.id);

  const [text, setText] = useState(item?.title ?? '');

  return (
    <View className='h-[88px] w-[228px] flex-col rounded-[10px] bg-white'>
      <View className='h-[44px] items-center justify-center gap-2 border-b-[0.5px] border-gray-500 px-[6px]'>
        <View className='h-[32px] w-[216px] rounded-[6px] bg-gray-300 px-[6px] py-1'>
          <TextInput
            className='text-16m items-center justify-center text-black'
            numberOfLines={1}
            value={text}
            onChangeText={setText}
            onEndEditing={() => {
              if (text.length > 0) updateItem(props.id, text);
            }}
          />
        </View>
      </View>
      <Pressable className='flex-1 flex-row items-center gap-2 pl-4 pr-[26px]'>
        <FolderOpen size={20} />
        <Text className='text-16r text-black'>오답노트 열기</Text>
      </Pressable>
    </View>
  );
};
