import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const ChevronDownFilledIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#1E1E21', size = 20, ...rest }, ref) => (
    <Svg ref={ref} width={size} height={size} viewBox='0 0 20 20' fill='none' {...rest}>
      <Path d='M5 7.5L10 12.5L15 7.5' fill={color} />
    </Svg>
  )
) as LucideIcon;

export default ChevronDownFilledIcon;
