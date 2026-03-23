import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const CalendarNotStartedIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#C6CAD4', size = 24, strokeWidth = 2, ...rest }, ref) => {
    const resolvedStrokeWidth = Number(strokeWidth);

    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
        <Path
          d='M10.1001 2.18216C11.3551 1.93928 12.6451 1.93928 13.9001 2.18216'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M13.9001 21.8179C12.6451 22.0607 11.3551 22.0607 10.1001 21.8179'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M17.6089 3.72119C18.6704 4.44041 19.5836 5.35706 20.2989 6.42119'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M2.18191 13.9001C1.93904 12.6451 1.93904 11.3551 2.18191 10.1001'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M20.2791 17.6089C19.5599 18.6704 18.6432 19.5836 17.5791 20.2989'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M21.8181 10.1001C22.061 11.3551 22.061 12.6451 21.8181 13.9001'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M3.72095 6.39117C4.44017 5.3297 5.35682 4.41645 6.42095 3.70117'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M6.39093 20.2791C5.32946 19.5599 4.41621 18.6432 3.70093 17.5791'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </Svg>
    );
  }
) as LucideIcon;

CalendarNotStartedIcon.displayName = 'CalendarNotStartedIcon';

export default CalendarNotStartedIcon;
