import React from 'react';
import Svg, { Mask, Path, Rect, G } from 'react-native-svg';

const CorrectIcon = () => {
  return (
    <Svg width={120} height={120} viewBox='0 0 120 120' fill='none'>
      <Rect x={10.5} y={10.5} width={99} height={99} rx={29.5} fill='#0FB700' stroke='#00A300' />
      <Mask
        id='a'
        style={{
          maskType: 'alpha',
        }}
        maskUnits='userSpaceOnUse'
        x={10}
        y={10}
        width={100}
        height={100}>
        <Rect x={10.5} y={10.5} width={99} height={99} rx={29.5} fill='#F3F5FB' stroke='#C6CAD4' />
      </Mask>
      <G mask='url(#a)'>
        <Path
          d='M87.613-.833l70.711 70.71-94.28 94.282-70.712-70.711L87.613-.833z'
          fill='#0AAD0A'
        />
      </G>
      <Path
        d='M60 82.5c12.426 0 22.5-10.074 22.5-22.5S72.426 37.5 60 37.5 37.5 47.574 37.5 60 47.574 82.5 60 82.5z'
        stroke='#fff'
        strokeWidth={6}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <Rect x={10.5} y={10.5} width={99} height={99} rx={29.5} stroke='#00A300' />
    </Svg>
  );
};

export default CorrectIcon;
