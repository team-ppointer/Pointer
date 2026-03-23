import React from 'react';
import { Svg, Path } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const ProfileBasicIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = 'white', size = 24, ...rest }, ref) => {
    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
        <Path
          d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
          fill='#617AF9'
        />
        <Path
          d='M11.999 14.7998C15.0572 14.7998 17.6287 16.8805 18.3779 19.7031C16.647 21.1377 14.4247 22 12.001 22C9.57575 22 7.35247 21.1363 5.62109 19.7002C6.37108 16.8791 8.94201 14.8 11.999 14.7998ZM12.0029 6C14.4328 6.00021 16.4023 7.97047 16.4023 10.4004C16.4021 12.8301 14.4327 14.7996 12.0029 14.7998C9.57301 14.7998 7.60275 12.8303 7.60254 10.4004C7.60254 7.97034 9.57288 6 12.0029 6Z'
          fill={color}
        />
      </Svg>
    );
  }
) as LucideIcon;

ProfileBasicIcon.displayName = 'ProfileBasicIcon';

export default ProfileBasicIcon;
