import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const EraserFilledIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ size = 24, strokeWidth = 2, color = 'black', ...rest }, ref) => {
    const resolvedStrokeWidth = Number(strokeWidth);

    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
        <Path
          d='M21.0001 21.0001H8.00006C7.73636 21.0007 7.47514 20.9491 7.23144 20.8484C6.98774 20.7476 6.76637 20.5997 6.58006 20.4131L2.58606 16.4141C2.21112 16.039 2.00049 15.5304 2.00049 15.0001C2.00049 14.4697 2.21112 13.9611 2.58606 13.5861L12.5861 3.58607C12.7718 3.40027 12.9923 3.25288 13.235 3.15232C13.4777 3.05176 13.7378 3 14.0006 3C14.2633 3 14.5234 3.05176 14.7661 3.15232C15.0088 3.25288 15.2293 3.40027 15.4151 3.58607L21.4141 9.58607C21.789 9.96113 21.9996 10.4697 21.9996 11.0001C21.9996 11.5304 21.789 12.039 21.4141 12.4141L12.8341 21.0001'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M5.08203 11.0898L13.91 19.9178'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M21.4136 12.4141L13.9124 19.9205L5.08179 11.0899L12.5856 3.58607C12.7713 3.40027 12.9918 3.25288 13.2345 3.15232C13.4772 3.05176 13.7374 3 14.0001 3C14.2628 3 14.5229 3.05176 14.7656 3.15232C15.0083 3.25288 15.2288 3.40027 15.4146 3.58607L21.4136 9.58607C21.7885 9.96113 21.9991 10.4697 21.9991 11.0001C21.9991 11.5304 21.7885 12.039 21.4136 12.4141Z'
          fill={color}
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </Svg>
    );
  }
) as LucideIcon;

export default EraserFilledIcon;
