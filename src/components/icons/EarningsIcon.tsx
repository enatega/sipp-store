import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = { active?: boolean };

export default function EarningsIcon({ active = false }: Props) {
  const { theme } = useAppTheme();
  const color = active ? theme.colors.primary : theme.colors.gray400;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.5} />
      <Path
        d="M12 7v1m0 8v1m3-6.5c0-1.1-.9-2-2-2h-2a2 2 0 000 4h2a2 2 0 010 4h-2a2 2 0 01-2-2"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
