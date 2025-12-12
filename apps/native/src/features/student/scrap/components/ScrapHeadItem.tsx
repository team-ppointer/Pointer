import { colors } from '@/theme/tokens';
import { Plus } from 'lucide-react-native';
import { Pressable, View, Text, Image } from 'react-native';
import TooltipPopover, { AddItemTooltipBox, ReviewItemTooltipBox } from './Modal/TooltipBox';
import Popover from 'react-native-popover-view';
import { Placement } from 'react-native-popover-view/dist/Types';
import { ChevronDownFilledIcon } from '@/components/system/icons';
import { FolderOverrides, ItemProps } from './ScrapItem';

export const ScrapAddItem = () => {
  return (
    <TooltipPopover
      placement={Placement.BOTTOM}
      children={<AddItemTooltipBox />}
      from={
        <Pressable className={`w-full items-center gap-3 rounded-[10px] p-[10px]`}>
          <View className='h-[145.5px] w-[145.5px] items-center justify-center border-[1.5px] border-dashed border-gray-600 p-[44px]'>
            <Plus size={24} color={colors['gray-600']} />
          </View>
          <View className={`w-full flex-col px-[6px]`}>
            <Text className='text-16sb text-[#1E1E21]'>추가하기</Text>
          </View>
        </Pressable>
      }
    />
  );
};

export const ScrapReviewItem = ({ props }: { props: ItemProps & FolderOverrides }) => {
  return (
    <Pressable className={`w-full items-center gap-3 rounded-[10px] p-[10px]`}>
      <Image
        source={require('../../../../../assets/images/scrap-review-note-cover.png')}
        resizeMode='contain'
        style={{ width: 145.5, height: 145.5 }}
      />
      <View className={`w-full flex-col px-[6px]`}>
        <View className='flex-row items-center justify-between'>
          <View className='flex-[0.8] flex-row gap-0.5'>
            <Text className='text-16sb text-[#1E1E21]' numberOfLines={2} ellipsizeMode='tail'>
              {props.title}
            </Text>
            <TooltipPopover
              children={<ReviewItemTooltipBox props={props} />}
              from={<ChevronDownFilledIcon />}
            />
          </View>
          <Text className='text-12m text-gray-700'>{props.amount}</Text>
        </View>
        <Text className='text-10r text-gray-700'>{props.timestamp}</Text>
      </View>
    </Pressable>
  );
};
