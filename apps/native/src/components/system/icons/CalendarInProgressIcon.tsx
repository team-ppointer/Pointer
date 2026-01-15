import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const CalendarInProgressIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#3A67EE', size = 24, strokeWidth = 2, ...rest }, ref) => {
    const resolvedStrokeWidth = Number(strokeWidth);

    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
        <Path
          d='M14 21.8001C18.5645 20.8736 22 16.8381 22 12.0002C22 7.16224 18.5645 3.12674 14 2.2002'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M9 12L11 14L15 10'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M6.18677 3.74962C7.24138 3.02721 8.42472 2.5137 9.6727 2.2369'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M3.58754 17.6512C2.86513 16.5966 2.35162 15.4133 2.07482 14.1653'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M2.01054 10.1508C2.24777 8.89072 2.7251 7.68805 3.41654 6.60828'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M9.98805 21.8279C8.728 21.5906 7.52533 21.1133 6.44556 20.4219'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </Svg>
    );
  }
) as LucideIcon;

export default CalendarInProgressIcon;
