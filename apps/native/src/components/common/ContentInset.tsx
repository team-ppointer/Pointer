import { View, type ViewProps, useWindowDimensions } from 'react-native';

interface ContainerProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

const getResponsiveHorizontalPadding = (width: number) => {
  const rawPadding = 0.265625 * width - 144;
  return Math.min(128, Math.max(16, rawPadding));
};

const ContentInset = ({ className, children, style, ...props }: ContainerProps) => {
  const { width } = useWindowDimensions();
  const paddingHorizontal = getResponsiveHorizontalPadding(width);

  return (
    <View className={`w-full ${className ?? ''}`} style={[{ paddingHorizontal }, style]} {...props}>
      {children}
    </View>
  );
};

export default ContentInset;
