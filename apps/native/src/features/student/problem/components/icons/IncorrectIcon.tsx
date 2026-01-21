import React from 'react';
import Svg, { Mask, Path, Rect, G } from 'react-native-svg';

const IncorrectIcon = () => {
  return (
    <Svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      fill="none"
    >
      <Rect
        x={10.5}
        y={10.5}
        width={99}
        height={99}
        rx={29.5}
        fill="#FF3B30"
        stroke="#D20000"
      />
      <Mask
        id="a"
        style={{
          maskType: "alpha"
        }}
        maskUnits="userSpaceOnUse"
        x={10}
        y={10}
        width={100}
        height={100}
      >
        <Rect
          x={10.5}
          y={10.5}
          width={99}
          height={99}
          rx={29.5}
          fill="#F3F5FB"
          stroke="#C6CAD4"
        />
      </Mask>
      <G mask="url(#a)">
        <Path
          d="M87.613-.833l70.711 70.71-94.28 94.282-70.712-70.711L87.613-.833z"
          fill="#EB271C"
        />
      </G>
      <Path
        d="M78 42L42 78M42 42l36 36"
        stroke="#fff"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x={10.5}
        y={10.5}
        width={99}
        height={99}
        rx={29.5}
        stroke="#D20000"
      />
    </Svg>
  );
};

export default IncorrectIcon;
