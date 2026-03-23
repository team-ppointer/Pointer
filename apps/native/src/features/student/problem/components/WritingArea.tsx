import { Pressable, View, Text } from 'react-native';
import { Undo2Icon, Redo2Icon, EraserIcon, PencilIcon, type LucideIcon } from 'lucide-react-native';
import { TextButton } from '@components/common';
import { colors } from '@theme/tokens';

export const IconButton = ({
  icon: Icon,
  backgroundColor,
  disabledBackgroundColor,
  iconColor,
  onPress,
  disabled,
  disabledColor,
  size,
  radius,
}: {
  icon: LucideIcon;
  backgroundColor?: string;
  disabledBackgroundColor?: string;
  iconColor: string;
  onPress: () => void;
  disabled?: boolean;
  disabledColor?: string;
  size?: number;
  radius?: number;
}) => {
  return (
    <Pressable
      className={`h-[${size}px] w-[${size}px] rounded-[${radius}px] p-[5.6px] ${disabled ? disabledBackgroundColor : backgroundColor} items-center justify-center`}
      onPress={onPress}>
      <Icon size={16} color={disabled ? disabledColor : iconColor} />
    </Pressable>
  );
};

const WritingArea = () => {
  return (
    <View className='my-[4px] overflow-hidden rounded-[8px] border border-gray-400 bg-white'>
      {/* Toolbar */}
      <View className='flex-row items-center justify-center gap-[10px] bg-gray-300 px-[6px] py-[4px]'>
        <View className='absolute left-[6px]'>
          <TextButton variant='gray' onPress={() => {}}>
            전체 지우기
          </TextButton>
        </View>
        <IconButton
          icon={Undo2Icon}
          backgroundColor='bg-gray-700'
          iconColor='white'
          onPress={() => {}}
          size={28}
          radius={4}
        />
        <IconButton
          icon={Redo2Icon}
          backgroundColor='bg-gray-100'
          iconColor={colors['gray-500']}
          onPress={() => {}}
          size={28}
          radius={4}
        />
        <View className='mx-[10px] h-[22px] w-[2px] bg-gray-500' />
        <IconButton
          icon={EraserIcon}
          iconColor={colors['gray-700']}
          onPress={() => {}}
          size={28}
          radius={4}
        />
        <IconButton
          icon={PencilIcon}
          iconColor={colors['gray-700']}
          onPress={() => {}}
          size={28}
          radius={4}
        />
      </View>
      <View className='min-h-[200px] items-center justify-center p-[20px]'>
        <Text className='text-16r text-gray-900'>필기 영역</Text>
      </View>
    </View>
  );
};

export default WritingArea;
