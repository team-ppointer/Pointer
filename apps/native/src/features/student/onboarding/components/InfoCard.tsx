import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

type Props = {
  icon?: ReactNode;
  title?: string;
  description: string;
};

const InfoCard = ({ icon, title, description }: Props) => {
  return (
    <View className='gap-[10px] rounded-[8px] bg-blue-100 p-[20px]'>
      <View className='flex-row items-center gap-[6px]'>
        {icon}
        {title ? <Text className='text-13b text-gray-900'>{title}</Text> : null}
      </View>
      <Text className='text-13r ml-[22px] text-gray-700'>{description}</Text>
    </View>
  );
};

export default InfoCard;
