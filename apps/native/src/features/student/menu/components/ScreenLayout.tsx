import { type ReactNode } from 'react';
import { View } from 'react-native';

import { Header } from '@components/common';

type Props = {
  title: string;
  children: ReactNode;
  onPressBack?: () => void;
  right?: ReactNode;
};

export const ScreenLayout = ({ title, children, onPressBack, right }: Props) => {
  return (
    <View className='w-full flex-1'>
      <Header title={title} showBackButton onPressBack={onPressBack} right={right} />
      {children}
    </View>
  );
};
