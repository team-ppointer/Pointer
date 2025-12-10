import type { LucideIcon, LucideProps } from 'lucide-react-native';
import React from 'react';
import { Path, Svg } from 'react-native-svg';

const ChevronUpFilledIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#1E1E21', size = 20, ...rest }, ref) => (
    <Svg ref={ref} width={size} height={size} viewBox='0 0 20 20' fill='none' {...rest}>
      <Path d='M6 15L12 9L18 15' fill={color} />
    </Svg>
  )
) as LucideIcon;

export default ChevronUpFilledIcon;
