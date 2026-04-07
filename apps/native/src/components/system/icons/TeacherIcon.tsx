import React from 'react';
import { Line, Path, Svg } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const TeacherIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ color = '#526BEA', size = 32, strokeWidth = 2, ...rest }, ref) => {
    const resolvedStrokeWidth = Number(strokeWidth);

    return (
      <Svg ref={ref} width={size} height={size} viewBox='0 0 32 32' fill='none' {...rest}>
        <Path
          d='M25.3348 28V26.0467C25.3348 25.0106 24.9232 24.017 24.1905 23.2843C23.4579 22.5517 22.4643 22.1401 21.4282 22.1401H15.5682C14.5321 22.1401 13.5385 22.5517 12.8058 23.2843C12.0732 24.017 11.6616 25.0106 11.6616 26.0467V28'
          fill={color}
        />
        <Path
          d='M25.3348 28V26.0467C25.3348 25.0106 24.9232 24.017 24.1905 23.2843C23.4579 22.5517 22.4643 22.1401 21.4282 22.1401H15.5682C14.5321 22.1401 13.5385 22.5517 12.8058 23.2843C12.0732 24.017 11.6616 25.0106 11.6616 26.0467V28H25.3348Z'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M18.498 19.2461C20.4211 19.2461 21.98 17.6872 21.98 15.7642C21.98 13.8411 20.4211 12.2822 18.498 12.2822C16.575 12.2822 15.0161 13.8411 15.0161 15.7642C15.0161 17.6872 16.575 19.2461 18.498 19.2461Z'
          fill={color}
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M8.9848 23.9004H4.68945C3.58488 23.9004 2.68945 23.005 2.68945 21.9004V7.03711C2.68945 5.93254 3.58488 5.03711 4.68945 5.03711H27.3096C28.4141 5.03711 29.3096 5.93254 29.3096 7.03711V22.4406C29.3096 23.2468 28.656 23.9004 27.8498 23.9004'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Line
          x1='6.36328'
          y1='9.09375'
          x2='14.1514'
          y2='9.09375'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
        />
        <Line
          x1='6.36328'
          y1='11.4434'
          x2='11.6611'
          y2='11.4434'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
        />
        <Line
          x1='6.36328'
          y1='13.9688'
          x2='11.6611'
          y2='13.9688'
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
        />
      </Svg>
    );
  }
) as LucideIcon;

TeacherIcon.displayName = 'TeacherIcon';

export default TeacherIcon;
