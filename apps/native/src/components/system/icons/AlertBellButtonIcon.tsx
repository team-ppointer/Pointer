import React from 'react';
import { Path, Circle, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const AlertButtonIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = 'black', size = 48, strokeWidth = 2, ...rest }, ref) => {
    const resolvedStrokeWidth = Number(strokeWidth);

    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 48 48' fill='none' {...rest}>
        <Path
          d='M22.2681 33C22.4436 33.304 22.6961 33.5565 23.0001 33.732C23.3041 33.9075 23.649 33.9999 24.0001 33.9999C24.3511 33.9999 24.696 33.9075 25 33.732C25.3041 33.5565 25.5565 33.304 25.7321 33'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M25.9161 14.3141C25.0136 14.01 24.0516 13.9251 23.1098 14.0664C22.168 14.2077 21.2733 14.5712 20.4998 15.1269C19.7263 15.6825 19.0961 16.4142 18.6614 17.2616C18.2268 18.1091 18.0001 19.0478 18.0001 20.0001C18.0001 24.4991 16.5891 25.9561 15.2601 27.3271C15.1297 27.4705 15.0437 27.6486 15.0127 27.8399C14.9816 28.0312 15.0068 28.2274 15.0852 28.4047C15.1636 28.5819 15.2918 28.7325 15.4542 28.8383C15.6167 28.944 15.8063 29.0002 16.0001 29.0001H32.0001C32.1939 29.0002 32.3836 28.944 32.546 28.8383C32.7084 28.7325 32.8366 28.5819 32.915 28.4047C32.9934 28.2274 33.0186 28.0312 32.9876 27.8399C32.9565 27.6486 32.8705 27.4705 32.7401 27.3271C32.5343 27.1152 32.3391 26.8933 32.1551 26.6621'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Circle
          cx={30}
          cy={20}
          r={3}
          fill='#E57A00'
          stroke='#E57A00'
          strokeWidth={resolvedStrokeWidth}
        />
      </Svg>
    );
  }
) as LucideIcon;

export default AlertButtonIcon;
