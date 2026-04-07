import React from 'react';
import { Svg, Rect, Path } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

const ScrapFolderDefaultIcon = React.forwardRef<
  React.ComponentRef<typeof Svg>,
  LucideProps & { isHovered?: boolean }
>(({ size = 124, style, isHovered = false, ...rest }, ref) => {
  // style에 width나 height가 있으면 size를 무시
  const flattenedStyle = StyleSheet.flatten(style);
  const hasStyleSize = !!flattenedStyle && (flattenedStyle.width || flattenedStyle.height);
  const svgProps = hasStyleSize
    ? { ...rest, style }
    : { width: size, height: size, ...rest, style };

  const fillColor = isHovered ? '#EDEEF2' : '#F8F9FC';

  return (
    <Svg ref={ref} viewBox='0 0 124 124' fill='none' {...svgProps}>
      <Rect x={2} y={2} width={94} height={94} rx={8} fill='#C5CEFF' />
      <Rect x={2} y={2} width={94} height={94} rx={8} stroke={fillColor} strokeWidth={4} />
      <Rect x={28} y={28} width={94} height={94} rx={8} fill='#C5CEFF' />
      <Rect x={28} y={28} width={94} height={94} rx={8} stroke={fillColor} strokeWidth={4} />
      <Path
        d='M90.334 90.3335C91.3506 90.3335 92.3257 89.9296 93.0446 89.2108C93.7634 88.4919 94.1673 87.5168 94.1673 86.5002V67.3335C94.1673 66.3169 93.7634 65.3418 93.0446 64.6229C92.3257 63.9041 91.3506 63.5002 90.334 63.5002H75.1923C74.5512 63.5065 73.9188 63.3519 73.3529 63.0505C72.787 62.7491 72.3057 62.3107 71.9531 61.7752L70.4007 59.4752C70.0516 58.9452 69.5764 58.5101 69.0178 58.209C68.4591 57.908 67.8344 57.7503 67.1998 57.7502H59.6673C58.6507 57.7502 57.6756 58.1541 56.9567 58.8729C56.2379 59.5918 55.834 60.5669 55.834 61.5835V86.5002C55.834 87.5168 56.2379 88.4919 56.9567 89.2108C57.6756 89.9296 58.6507 90.3335 59.6673 90.3335H90.334Z'
        fill='#617AF9'
      />
    </Svg>
  );
});

ScrapFolderDefaultIcon.displayName = 'ScrapFolderDefaultIcon';

export default ScrapFolderDefaultIcon;
