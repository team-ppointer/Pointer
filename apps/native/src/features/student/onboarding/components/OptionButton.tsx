import { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  rightSlot?: ReactNode;
  isCentered?: boolean;
};

const OptionButton = ({
  label,
  description,
  selected,
  onPress,
  rightSlot,
  isCentered = false,
}: Props) => {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-[10px] flex-row items-center rounded-[8px] border px-[20px] py-[16px] ${
        selected ? 'border-primary-500 bg-primary-100' : 'border-gray-300 bg-white'
      } ${isCentered ? 'justify-center' : 'justify-between'}`}>
      <Text className={`text-14m text-black`}>{label}</Text>
      {description ? (
        <Text className='text-14r text-gray-600'>{description}</Text>
      ) : rightSlot ? (
        rightSlot
      ) : null}
    </Pressable>
  );
};

export default OptionButton;
