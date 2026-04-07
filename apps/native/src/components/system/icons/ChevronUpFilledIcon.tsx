import type { LucideIcon, LucideProps } from 'lucide-react-native';
import React from 'react';
import { Path, Svg } from 'react-native-svg';

const ChevronUpFilledIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#1E1E21', size = 20, ...rest }, ref) => (
    <Svg ref={ref} width={size} height={size} viewBox='0 0 20 20' fill='none' {...rest}>
      <Path d='M5 12.5L10 7.5L15 12.5' fill={color} />
    </Svg>
  )
) as LucideIcon;

ChevronUpFilledIcon.displayName = 'ChevronUpFilledIcon';

export default ChevronUpFilledIcon;
