import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type Props = {
  icon?: ReactNode;
  title?: string;
  description: string;
};

const InfoCard = ({ icon, title, description }: Props) => {
  return (
    <View className='rounded-[8px] bg-blue-100 p-[20px] gap-[10px]'>
      <View className='flex-row items-center gap-[6px]'>
        {icon}
        {title ? <Text className='text-13b text-gray-900'>{title}</Text> : null}
      </View>
      <Text className='text-13r text-gray-700 ml-[22px]'>{description}</Text>
    </View>
  );
};

export default InfoCard;

