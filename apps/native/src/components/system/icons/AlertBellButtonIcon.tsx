import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const AlertButtonIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ size = 24, ...rest }, ref) => {
    return (
      <>
        <Svg ref={ref} width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
          <Path
            d='M10.2681 21C10.4436 21.304 10.6961 21.5565 11.0001 21.732C11.3041 21.9075 11.649 21.9999 12.0001 21.9999C12.3511 21.9999 12.696 21.9075 13 21.732C13.3041 21.5565 13.5565 21.304 13.7321 21'
            stroke={rest.color || '#9FA4AE'}
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <Path
            d='M13.9159 2.31415C13.0134 2.01002 12.0514 1.9251 11.1096 2.06642C10.1677 2.20774 9.27304 2.57124 8.49953 3.12685C7.72601 3.68246 7.09586 4.41423 6.6612 5.26164C6.22654 6.10905 5.99985 7.04776 5.99987 8.00015C5.99987 12.4991 4.58887 13.9561 3.25987 15.3271C3.12944 15.4705 3.04348 15.6486 3.01243 15.8399C2.98138 16.0312 3.00659 16.2274 3.08498 16.4047C3.16338 16.5819 3.29158 16.7325 3.454 16.8383C3.61643 16.944 3.80607 17.0002 3.99987 17.0001H19.9999C20.1937 17.0002 20.3833 16.944 20.5457 16.8383C20.7082 16.7325 20.8364 16.5819 20.9148 16.4047C20.9932 16.2274 21.0184 16.0312 20.9873 15.8399C20.9563 15.6486 20.8703 15.4705 20.7399 15.3271C20.5341 15.1152 20.3388 14.8933 20.1549 14.6621'
            stroke={rest.color || '#9FA4AE'}
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <Path
            d='M18 11C19.6569 11 21 9.65685 21 8C21 6.34315 19.6569 5 18 5C16.3431 5 15 6.34315 15 8C15 9.65685 16.3431 11 18 11Z'
            fill='#E57A00'
            stroke='#E57A00'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </Svg>
      </>
    );
  }
) as LucideIcon;

AlertButtonIcon.displayName = 'AlertButtonIcon';

export default AlertButtonIcon;
