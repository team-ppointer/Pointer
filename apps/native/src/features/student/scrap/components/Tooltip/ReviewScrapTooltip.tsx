import { FolderOpen } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';

import { type ScrapListItemProps } from '../Card/types';

import { TooltipContainer } from './TooltipContainer';
import { TooltipMenuItem } from './TooltipMenuItem';

import { type StudentRootStackParamList } from '@/navigation/student/types';

export interface ReviewScrapTooltipProps {
  props: ScrapListItemProps;
  onClose?: () => void;
}

// Backward compatibility
export type ReviewItemTooltipProps = ReviewScrapTooltipProps;

export const ReviewScrapTooltip = ({ props, onClose }: ReviewScrapTooltipProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  const handleOpenReview = () => {
    onClose?.();
    setTimeout(() => {
      navigation.push('ScrapContent', { id: props.id });
    }, 100);
  };

  return (
    <TooltipContainer
      height='h-[88px]'
      header={
        <View className='h-[32px] w-[216px] rounded-[6px] bg-gray-300 px-[6px] py-1'>
          <Text className='text-16m items-center justify-center text-black opacity-40'>
            오답노트
          </Text>
        </View>
      }>
      <TooltipMenuItem
        icon={<FolderOpen size={20} />}
        label='오답노트 열기'
        onPress={handleOpenReview}
        isLastItem
      />
    </TooltipContainer>
  );
};

// Backward compatibility
export const ReviewItemTooltip = ReviewScrapTooltip;
