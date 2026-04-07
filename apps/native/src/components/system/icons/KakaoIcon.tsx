import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const KakaoIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#3C1E1E', size = 20, ...rest }, ref) => (
    <Svg ref={ref} width={size} height={size} viewBox='0 0 20 20' fill='none' {...rest}>
      <Path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2.52539 8.78804C2.52539 5.58874 5.87419 2.98744 10.0004 2.98744C14.1266 2.98744 17.4754 5.58127 17.4754 8.78804C17.4754 11.9948 14.1266 14.5961 10.0004 14.5961C9.84247 14.5961 9.68455 14.5829 9.52758 14.5697C9.37249 14.5567 9.21833 14.5438 9.06602 14.5438L5.43317 16.9582C5.38174 16.9937 5.32068 17.0127 5.25818 17.0125C5.19567 17.0124 5.13471 16.9931 5.08346 16.9573C5.03222 16.9215 4.99314 16.8709 4.97148 16.8123C4.94981 16.7537 4.94659 16.6898 4.96224 16.6293L5.79197 13.587C3.81857 12.5255 2.52539 10.7839 2.52539 8.78804Z'
        fill={color}
      />
    </Svg>
  )
) as LucideIcon;

KakaoIcon.displayName = 'KakaoIcon';

export default KakaoIcon;
