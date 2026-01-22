import React from 'react';
import { Svg, Rect, Path, G, Defs, ClipPath } from 'react-native-svg';
import type { LucideIcon, LucideProps } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

const ScrapDefaultIcon = React.forwardRef<React.ComponentRef<typeof Svg>, LucideProps>(
  ({ size = 124, style, ...rest }, ref) => {
    // style에 width나 height가 있으면 size를 무시
    const flattenedStyle = StyleSheet.flatten(style);
    const hasStyleSize = !!flattenedStyle && (flattenedStyle.width || flattenedStyle.height);
    const numericSize = typeof size === 'number' ? size : Number(size) || 48;
    const svgProps = hasStyleSize
      ? { ...rest, style }
      : { width: numericSize, height: (numericSize * 116) / 99, ...rest, style };

    return (
      <Svg ref={ref} viewBox='0 0 99 116' fill='none' {...svgProps}>
        <G clipPath='url(#clip0)'>
          <Rect width='98' height='116' rx='6' fill='#C5CEFF' />
          <Path
            d='M8 116H6C2.68629 116 0 113.314 0 110V6C0 2.68629 2.68629 0 6 0H8V116Z'
            fill='#93A4FC'
          />
          <Rect x='35.5' y='18.5' width='35' height='21' rx='3.5' fill='#F3F5FB' stroke='#93A4FC' />
          <Rect x='39' y='22' width='24' height='4' rx='2' fill='#DFE2E7' />
          <Rect x='39' y='28' width='15' height='4' rx='2' fill='#DFE2E7' />
        </G>

        <Defs>
          <ClipPath id='clip0'>
            <Rect width='98.0476' height='116' rx='6' fill='white' />
          </ClipPath>
        </Defs>
      </Svg>
    );
  }
) as LucideIcon;

export default ScrapDefaultIcon;
