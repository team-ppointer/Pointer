import React from 'react';
import { Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const PencilFilledIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ size = 24, strokeWidth = 2, color = 'black', ...rest }, ref) => {
    const resolvedStrokeWidth = Number(strokeWidth);

    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
        <Path
          d='M21.1739 6.81189C21.7026 6.28332 21.9997 5.56636 21.9998 4.81875C21.9999 4.07113 21.703 3.3541 21.1744 2.82539C20.6459 2.29668 19.9289 1.99961 19.1813 1.99951C18.4337 1.99942 17.7166 2.29632 17.1879 2.82489L3.84193 16.1739C3.60975 16.4054 3.43805 16.6904 3.34193 17.0039L2.02093 21.3559C1.99509 21.4424 1.99314 21.5342 2.01529 21.6217C2.03743 21.7092 2.08285 21.7891 2.14673 21.8529C2.21061 21.9167 2.29055 21.962 2.37809 21.984C2.46563 22.006 2.55749 22.0039 2.64393 21.9779L6.99693 20.6579C7.3101 20.5626 7.59511 20.392 7.82693 20.1609L21.1739 6.81189Z'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M15 5L19 9'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M15.0067 5.00684L18.9931 8.99325L7.82693 20.1611C7.59511 20.3922 7.3101 20.5629 6.99693 20.6581L2.64393 21.9781C2.55749 22.0041 2.46563 22.0062 2.37809 21.9842C2.29056 21.9622 2.21061 21.9169 2.14673 21.8531C2.08285 21.7894 2.03743 21.7095 2.01529 21.622C1.99314 21.5345 1.99509 21.4426 2.02093 21.3561L3.34193 17.0041C3.43805 16.6907 3.60975 16.4056 3.84193 16.1741L15.0067 5.00684Z'
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

PencilFilledIcon.displayName = 'PencilFilledIcon';

export default PencilFilledIcon;
