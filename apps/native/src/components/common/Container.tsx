import { View, type ViewProps } from 'react-native';

interface ContainerProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

const Container = ({ className, children, style, ...props }: ContainerProps) => {
  return (
    <View
      className={`w-full px-[16px] md:px-[60px] lg:px-[128px] ${className}`}
      style={style}
      {...props}>
      {children}
    </View>
  );
};

export default Container;
