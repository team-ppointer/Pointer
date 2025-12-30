import { colors } from '@/theme/tokens';
import { Trash2, Undo2 } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';
import { showToast } from '../Modal/Toast';
import { useRestoreTrash } from '@/apis';
import type { TrashListItemProps } from '../Card/types';

export interface TrashItemTooltipProps {
  item: TrashListItemProps;
  onClose?: () => void;
  onDeletePress?: () => void;
}

export const TrashItemTooltip = ({ item, onClose, onDeletePress }: TrashItemTooltipProps) => {
  const { mutateAsync: restoreTrash } = useRestoreTrash();

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
            await restoreTrash({
              items: [
                {
                  id: item.id,
                  type: item.type as 'FOLDER' | 'SCRAP',
                },
              ],
            } as any);
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
