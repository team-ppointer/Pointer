import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
const NoNoticeIcon = () => (
  <Svg width={100} height={100} viewBox='0 0 100 100' fill='none'>
    <Path
      d='M23.4317 57.0247C22.2212 53.0299 25.2108 49 29.385 49C32.1258 49 34.5435 50.7937 35.3384 53.4166L42.2437 76.2042C43.118 79.0895 40.9588 82 37.944 82C33.8201 82 30.1821 79.3011 28.9862 75.3544L23.4317 57.0247Z'
      fill='#DFE2E7'
    />
    <Rect x={63} y={36} width={23} height={20} rx={10} fill='#DFE2E7' />
    <Rect x={14} y={32} width={41} height={28} rx={14} fill='#C6CAD4' />
    <Rect x={69} y={17} width={9} height={58} rx={4.5} fill='#C6CAD4' />
    <Path d='M38 32L69 21V71L38 60V32Z' fill='#DFE2E7' />
  </Svg>
);
export default NoNoticeIcon;
