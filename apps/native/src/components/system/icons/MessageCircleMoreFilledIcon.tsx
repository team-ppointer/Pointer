import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const MessageCircleMoreFilledIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#1E1E21', size = 24, strokeWidth = 2, ...rest }, ref) => {
    const resolvedStrokeWidth = Number(strokeWidth);

    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
        <Path
          d='M2.99194 16.3422C3.13897 16.7131 3.17171 17.1195 3.08594 17.5092L2.02094 20.7992C1.98662 20.966 1.99549 21.1389 2.04671 21.3013C2.09793 21.4638 2.1898 21.6105 2.3136 21.7275C2.43741 21.8444 2.58904 21.9279 2.75413 21.9698C2.91923 22.0118 3.0923 22.0109 3.25694 21.9672L6.66994 20.9692C7.03765 20.8962 7.41846 20.9281 7.76894 21.0612C9.90432 22.0584 12.3233 22.2694 14.5991 21.6569C16.8749 21.0444 18.8612 19.6478 20.2076 17.7136C21.5541 15.7793 22.1741 13.4316 21.9582 11.0847C21.7424 8.73787 20.7046 6.54265 19.028 4.88638C17.3514 3.23011 15.1436 2.21922 12.7943 2.03208C10.445 1.84494 8.10507 2.49356 6.18738 3.86352C4.26968 5.23348 2.89747 7.23672 2.31283 9.51982C1.72819 11.8029 1.9687 14.2191 2.99194 16.3422Z'
          fill={color}
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M8 12H8.01'
          stroke='#FFFFFF'
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M12 12H12.01'
          stroke='#FFFFFF'
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M16 12H16.01'
          stroke='#FFFFFF'
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </Svg>
    );
  }
) as LucideIcon;

MessageCircleMoreFilledIcon.displayName = 'MessageCircleMoreFilledIcon';

export default MessageCircleMoreFilledIcon;
