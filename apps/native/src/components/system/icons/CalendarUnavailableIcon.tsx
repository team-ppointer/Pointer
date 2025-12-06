import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const CalendarUnavailableIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#EDEEF2', size = 24, strokeWidth = 2, ...rest }, ref) => {
    const resolvedStrokeWidth = Number(strokeWidth);

    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
        <Path
          d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
          fill={color}
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M16.2426 12H7.75736'
          stroke='#9FA4AE'
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </Svg>
    );
  }
) as LucideIcon;

export default CalendarUnavailableIcon;
