import { FolderOpen } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';
import { ScrapListItemProps } from '../Card/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentRootStackParamList } from '@/navigation/student/types';

export interface ReviewItemTooltipProps {
  props: ScrapListItemProps;
  onClose?: () => void;
}

export const ReviewItemTooltip = ({ props, onClose }: ReviewItemTooltipProps) => {
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
            navigation.push('ScrapContent', { id: props.id });
          }, 100);
        }}>
        <FolderOpen size={20} />
        <Text className='text-16r text-black'>오답노트 열기</Text>
      </Pressable>
    </View>
  );
};
