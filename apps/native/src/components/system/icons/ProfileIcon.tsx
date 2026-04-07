import React from 'react';
import { Svg, Rect, Path } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const ProfileIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#617AF9', size = 48, ...rest }, ref) => {
    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 48 48' fill='none' {...rest}>
        <Rect width='48' height='48' rx='24' fill='#C5CEFF' />

        <Path
          d='M35.8167 37.7861C35.8167 34.6278 34.5621 31.5988 32.3289 29.3656C30.0956 27.1323 27.0667 25.8777 23.9084 25.8777C20.7501 25.8777 17.7211 27.1323 15.4879 29.3656C13.2546 31.5988 12 34.6278 12 37.7861'
          fill={color}
        />

        <Path
          d='M23.9038 25.8777C28.2883 25.8777 31.8427 22.3233 31.8427 17.9388C31.8427 13.5543 28.2883 9.99988 23.9038 9.99988C19.5192 9.99988 15.9648 13.5543 15.9648 17.9388C15.9648 22.3233 19.5192 25.8777 23.9038 25.8777Z'
          fill={color}
        />
      </Svg>
    );
  }
) as LucideIcon;

ProfileIcon.displayName = 'ProfileIcon';

export default ProfileIcon;
