import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = { active?: boolean };

export default function HomeIcon({ active = false }: Props) {
  const { theme } = useAppTheme();
  const color = active ? theme.colors.primary : theme.colors.gray400;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 21V12h6v9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
