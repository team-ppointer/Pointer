import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const MessageSquareWarningFilledIcon = React.forwardRef<
  React.ComponentRef<typeof Svg>,
  LucideProps
>(({ color = '#1E1E21', size = 24, strokeWidth = 2, ...rest }, ref) => {
  const resolvedStrokeWidth = Number(strokeWidth);

  return (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      strokeWidth={resolvedStrokeWidth}
      {...rest}>
      <Path
        d='M20 3C20.5304 3 21.039 3.21086 21.4141 3.58594C21.7891 3.96101 22 4.46957 22 5V17C22 17.5304 21.7891 18.039 21.4141 18.4141C21.039 18.7891 20.5304 19 20 19H6.82812C6.29776 19.0001 5.78904 19.2109 5.41406 19.5859L3.21191 21.7881C3.11266 21.8873 2.98627 21.955 2.84863 21.9824C2.71092 22.0098 2.5682 21.9951 2.43848 21.9414C2.3089 21.8877 2.19812 21.7972 2.12012 21.6807C2.04212 21.564 2.00004 21.4265 2 21.2861V5C2 4.46957 2.21086 3.96101 2.58594 3.58594C2.96101 3.21086 3.46957 3 4 3H20ZM12 14C11.4477 14 11 14.4477 11 15C11 15.5523 11.4477 16 12 16H12.0098C12.5621 16 13.0098 15.5523 13.0098 15C13.0098 14.4477 12.5621 14 12.0098 14H12ZM12 6C11.4477 6 11 6.44772 11 7V11C11 11.5523 11.4477 12 12 12C12.5523 12 13 11.5523 13 11V7C13 6.44772 12.5523 6 12 6Z'
        fill={color}
      />
    </Svg>
  );
}) as LucideIcon;

export default MessageSquareWarningFilledIcon;
