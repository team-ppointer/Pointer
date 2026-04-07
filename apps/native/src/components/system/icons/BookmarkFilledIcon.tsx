import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const BookmarkFilledIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#1E1E21', size = 24, strokeWidth = 2, ...rest }, ref) => {
    const resolvedStrokeWidth = Number(strokeWidth);

    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
        <Path
          d='M19 21L12 17L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z'
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

BookmarkFilledIcon.displayName = 'BookmarkFilledIcon';

export default BookmarkFilledIcon;
