import { View } from 'react-native';

const Container = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <View className={`w-full px-[16px] md:px-[60px] lg:px-[128px] ${className}`}>{children}</View>
  );
};

export default Container;
