import { colors } from '@/theme/tokens';
import { Plus } from 'lucide-react-native';
import { Pressable, View, Text } from 'react-native';
import { TooltipPopover, AddItemTooltipBox, ReviewItemTooltipBox } from '../../Tooltip';
import { Placement } from 'react-native-popover-view/dist/Types';
import { ChevronDownFilledIcon } from '@/components/system/icons';
import { ScrapListItemProps } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useState } from 'react';
import { CreateFolderModal } from '../../Modal/CreateFolderModal';
import { LoadQnaImageModal } from '../../Modal/LoadQnaImageModal';

export const ScrapAddItem = () => {
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [isQnaImageModalVisible, setisQnaImageModalVisible] = useState(false);

  return (
    <>
      <TooltipPopover
        placement={Placement.BOTTOM}
        children={(close: () => void) => (
          <AddItemTooltipBox
            onClose={close}
            onOpenFolderModal={() => {
              close();
              setTimeout(() => {
                setIsFolderModalVisible(true);
              }, 200);
            }}
            onOpenQnaImgModal={() => {
              close();
              setTimeout(() => {
                setisQnaImageModalVisible(true);
              }, 200);
            }}
          />
        )}
        from={
          <View className={`h-full w-full items-center gap-3 rounded-[10px] p-[10px]`}>
            <View className='h-[70%] w-full items-center justify-center border-[1.5px] border-dashed border-gray-600 p-[44px]'>
              <Plus size={24} color={colors['gray-600']} />
            </View>
            <View className={`w-full flex-col px-[6px]`}>
              <Text className='text-16sb text-[#1E1E21]'>추가하기</Text>
            </View>
          </View>
        }
      />
      <CreateFolderModal
        visible={isFolderModalVisible}
        onClose={() => setIsFolderModalVisible(false)}
        onSuccess={() => {}}
      />
      <LoadQnaImageModal
        visible={isQnaImageModalVisible}
        onClose={() => setisQnaImageModalVisible(false)}
        onSuccess={() => {}}
      />
    </>
  );
};

export const ScrapReviewItem = ({ props }: { props: ScrapListItemProps }) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  return (
    <Pressable
      className={`w-full items-center gap-3 rounded-[10px] p-[10px]`}
      onPress={() => navigation.push('ScrapContent', { id: props.id })}>
      <View className={`w-full flex-col px-[6px]`}>
        <View className='h-[145.5px] w-[145.5px] rounded-[10px] bg-gray-600' />

        <View className='flex-row items-center justify-between'>
          <View className='flex-[0.8] flex-row gap-0.5'>
            <Text className='text-16sb text-[#1E1E21]' numberOfLines={2} ellipsizeMode='tail'>
              {props.name}
            </Text>
            <TooltipPopover
              children={(close: () => void) => (
                <ReviewItemTooltipBox props={props} onClose={close} />
              )}
              from={<ChevronDownFilledIcon />}
            />
          </View>
          {props.type === 'FOLDER' && props.scrapCount !== undefined && (
            <Text className='text-12m text-gray-700'>{props.scrapCount}</Text>
          )}
        </View>
        <Text className='text-10r text-gray-700'>
          {new Date(props.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
};
