import React from 'react';
import { Path, Svg, Defs, LinearGradient, Stop } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const NoNotificationBellIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ size = 100, strokeWidth = 1.5, ...rest }, ref) => {
    const resolvedStrokeWidth = Number(strokeWidth);

    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 100 100' fill='none' {...rest}>
        <Path
          d='M42.7837 84.0828H57.2173C58.4375 84.0828 59.5658 84.7343 60.1763 85.7917C60.7484 86.7827 60.7833 87.9887 60.2827 89.0066L60.1763 89.2078C59.1448 90.994 57.6613 92.4785 55.8755 93.5095C54.0896 94.5404 52.0628 95.0827 50.0005 95.0828C47.9381 95.0827 45.9114 94.5406 44.1255 93.5095C42.4512 92.5429 41.0442 91.1775 40.0249 89.5388L39.8257 89.2078C39.2153 88.1505 39.2149 86.8484 39.8247 85.7917C40.4351 84.7347 41.5634 84.0829 42.7837 84.0828Z'
          fill='url(#paint0_linear)'
          stroke='url(#paint1_linear)'
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        <Path
          d='M49.999 4.91577C57.5355 4.91585 64.7637 7.90992 70.0928 13.239C75.4218 18.5681 78.415 25.7962 78.415 33.3328C78.4151 42.3477 79.8271 48.0232 81.7178 52.0251C83.3762 55.5354 85.4825 57.9531 87.8418 60.4197L88.9502 61.571C89.9344 62.6562 90.5834 64.0043 90.8184 65.4509C91.0538 66.9017 90.8637 68.3907 90.2695 69.7341C89.7122 70.994 88.822 72.077 87.6982 72.8679L87.4707 73.0222C86.3167 73.7733 84.9808 74.1944 83.6074 74.2439L83.332 74.2488H16.6621C15.1928 74.2475 13.755 73.8202 12.5244 73.0173C11.294 72.2144 10.3235 71.0701 9.73047 69.7253C9.17475 68.4648 8.97304 67.0781 9.14551 65.7146L9.18555 65.4421C9.42293 63.9914 10.0762 62.6399 11.0664 61.5544C13.9036 58.6227 16.3841 56.0348 18.2783 52.0251C20.1687 48.0233 21.582 42.3477 21.582 33.3328C21.582 25.7963 24.577 18.5682 29.9062 13.239C35.2354 7.91017 42.4628 4.9158 49.999 4.91577Z'
          fill='url(#paint2_linear)'
          stroke='url(#paint3_linear)'
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        <Defs>
          <LinearGradient
            id='paint0_linear'
            x1='50'
            y1='83.33'
            x2='50'
            y2='95.83'
            gradientUnits='userSpaceOnUse'>
            <Stop stopColor='#ACB9FF' />
            <Stop offset='1' stopColor='#C5CEFF' />
          </LinearGradient>

          <LinearGradient
            id='paint1_linear'
            x1='50'
            y1='83.33'
            x2='50'
            y2='95.83'
            gradientUnits='userSpaceOnUse'>
            <Stop stopColor='#9AA9FA' stopOpacity='0' />
            <Stop offset='1' stopColor='#9AA9FA' />
          </LinearGradient>

          <LinearGradient
            id='paint2_linear'
            x1='50'
            y1='4.16'
            x2='50'
            y2='75'
            gradientUnits='userSpaceOnUse'>
            <Stop stopColor='#ACB9FF' />
            <Stop offset='1' stopColor='#C5CEFF' />
          </LinearGradient>

          <LinearGradient
            id='paint3_linear'
            x1='50'
            y1='4.16'
            x2='50'
            y2='75'
            gradientUnits='userSpaceOnUse'>
            <Stop stopColor='#9AA9FA' stopOpacity='0' />
            <Stop offset='1' stopColor='#9AA9FA' />
          </LinearGradient>
        </Defs>
      </Svg>
    );
  }
) as LucideIcon;

NoNotificationBellIcon.displayName = 'NoNotificationBellIcon';

export default NoNotificationBellIcon;
