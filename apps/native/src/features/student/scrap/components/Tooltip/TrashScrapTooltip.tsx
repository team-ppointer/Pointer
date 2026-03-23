import { Trash2, Undo2 } from 'lucide-react-native';

import { colors } from '@/theme/tokens';
import { useRestoreTrash } from '@/apis';

import { showToast } from '../Notification/Toast';
import type { TrashListItemProps } from '../Card/types';

import { TooltipContainer } from './TooltipContainer';
import { TooltipMenuItem } from './TooltipMenuItem';

export interface TrashScrapTooltipProps {
  item: TrashListItemProps;
  onClose?: () => void;
  onDeletePress?: () => void;
}

// Backward compatibility
export type TrashItemTooltipProps = TrashScrapTooltipProps;

export const TrashScrapTooltip = ({ item, onClose, onDeletePress }: TrashScrapTooltipProps) => {
  const { mutateAsync: restoreTrash } = useRestoreTrash();

  const handlePermanentDelete = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (onDeletePress) {
      onDeletePress();
    } else {
      onClose?.();
    }
  };

  const handleRestore = async () => {
    try {
      await restoreTrash({
        items: [
          {
            id: item.id,
            type: item.type as 'FOLDER' | 'SCRAP',
          },
        ],
      });
      showToast('success', '선택된 파일이 복구되었습니다.');
      onClose?.();
    } catch (error: unknown) {
      showToast('error', error instanceof Error ? error.message : '복구에 실패했습니다.');
    }
  };

  return (
    <TooltipContainer height='h-[88px]'>
      <TooltipMenuItem
        icon={<Trash2 size={20} color={colors['red-400']} />}
        label='영구 삭제하기'
        onPress={handlePermanentDelete}
        isDangerous
      />
      <TooltipMenuItem
        icon={<Undo2 size={20} />}
        label='복구하기'
        onPress={handleRestore}
        isLastItem
      />
    </TooltipContainer>
  );
};

// Backward compatibility
export const TrashItemTooltip = TrashScrapTooltip;
