import { colors } from '@/theme/tokens';
import { Check, Plus } from 'lucide-react-native';
import { Pressable, View, Text } from 'react-native';
import { TooltipPopover, AddItemTooltipBox } from '../../Tooltip';
import { Placement } from 'react-native-popover-view/dist/Types';
import { BookmarkFilledIcon } from '@/components/system/icons';
import { isItemSelected, State } from '../../../utils/reducer';
import { useScrapModal } from '../../../contexts/ScrapModalsContext';

interface ScrapHeadCardProps {
  reducerState: State;
  onCheckPress?: () => void;
}

export const ScrapAddCard = (props: ScrapHeadCardProps) => {
  const isSelecting = props?.reducerState.isSelecting ?? false;
  const { openCreateFolderModal, openLoadQnaImageModal } = useScrapModal();

  const addItemContent = (
    <View className='w-full items-center rounded-[10px] p-[10px]'>
      <View className='gap-3'>
        <View className='items-center'>
          <View className='aspect-square w-full items-center justify-center rounded-[12px] border-[1.5px] border-dashed border-gray-600 p-[44px]'>
            <Plus size={24} color={colors['gray-600']} />
          </View>
        </View>
        <Text className='text-16sb text-[#1E1E21]'>추가하기</Text>
      </View>
    </View>
  );

  return (
    <>
      {isSelecting ? (
        <View style={{ opacity: 0.5 }}>{addItemContent}</View>
      ) : (
        <TooltipPopover
          placement={Placement.BOTTOM}
          children={(close: () => void) => (
            <AddItemTooltipBox
              onClose={close}
              onOpenFolderModal={() => {
                close();
                setTimeout(() => {
                  openCreateFolderModal();
                }, 200);
              }}
              onOpenQnaImgModal={() => {
                close();
                setTimeout(() => {
                  openLoadQnaImageModal();
                }, 200);
              }}
            />
          )}
          from={addItemContent}
        />
      )}
    </>
  );
};

export const ScrapAllCard = (props: ScrapHeadCardProps) => {
  const isSelected = isItemSelected(props.reducerState.selectedItems, undefined, 'FOLDER');

  return (
    <Pressable
      className={`${isSelected ? 'bg-gray-300 p-[10px]' : ''}  w-full items-center rounded-[10px] p-[10px]`}
      onPress={() => {
        if (props.reducerState.isSelecting) {
          props.onCheckPress?.();
          return;
        }
      }}>
      <View className='gap-3'>
        <View className='items-center'>
          <View className='aspect-square w-full items-center justify-center rounded-[10px] bg-blue-200'>
            <BookmarkFilledIcon color={colors['primary-500']} size={32} />
          </View>
          {props.reducerState.isSelecting && (
            <Pressable
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
        <View className='w-full flex-col px-1'>
          <Text className='text-16sb text-[#1E1E21]'>전체 스크랩</Text>
        </View>
      </View>
    </Pressable>
  );
};
