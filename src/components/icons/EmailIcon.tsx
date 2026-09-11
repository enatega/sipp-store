import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export default function EmailIcon({ size = 48, color = '#90E36D' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Envelope body */}
      <Rect x={4} y={10} width={40} height={28} rx={4} stroke={color} strokeWidth={2.5} />
      {/* Envelope flap / V shape */}
      <Path
        d="M4 14l20 14L44 14"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
