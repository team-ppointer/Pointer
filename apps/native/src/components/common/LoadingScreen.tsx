import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '@theme/tokens';

type Props = {
  label?: string;
};

const LoadingScreen = ({ label = '잠시만 기다려 주세요.' }: Props) => {
  return (
    <View className='flex-1 items-center justify-center bg-gray-100 px-12'>
      <ActivityIndicator size='large' color={colors['primary-500']} />
      <Text className='mt-6 text-center text-[16px] text-gray-800'>{label}</Text>
    </View>
  );
};

export default LoadingScreen;
