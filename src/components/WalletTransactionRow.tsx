import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import Text from './Text';
import { useAppTheme } from '../theme/ThemeProvider';

type IconType = 'cashout' | 'pending';

type Props = {
  iconType: IconType;
  label: string;
  date: string;
  amount: string;
  amountColor?: string;
};

/**
 * Single row for wallet transactions and pending requests.
 * iconType 'cashout' = upload arrow (gray)
 * iconType 'pending' = download arrow (red)
 */
export default function WalletTransactionRow({
  iconType,
  label,
  date,
  amount,
  amountColor,
}: Props) {
  const { theme } = useAppTheme();

  const defaultAmountColor = amountColor ?? theme.colors.text;
  const iconColor = iconType === 'pending' ? '#EF4444' : theme.colors.gray500;
  const borderColor = iconType === 'pending' ? '#EF4444' : theme.colors.gray300;

  return (
    <View style={styles.row}>
      {/* Icon box */}
      <View style={[styles.iconBox, { borderColor }]}>
        {iconType === 'pending' ? (
          <DownloadArrowIcon color={iconColor} />
        ) : (
          <UploadArrowIcon color={iconColor} />
        )}
      </View>

      {/* Label + date */}
      <View style={styles.info}>
        <Text variant="body" weight="semiBold" color={theme.colors.text}>
          {label}
        </Text>
        <Text variant="caption" color={theme.colors.mutedText}>
          {date}
        </Text>
      </View>

      {/* Amount */}
      <Text variant="body" weight="bold" color={defaultAmountColor}>
        {amount}
      </Text>
    </View>
  );
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

function UploadArrowIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      {/* Vertical shaft */}
      <Line x1="12" y1="19" x2="12" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Arrow head pointing up */}
      <Path
        d="M6 11l6-6 6 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base line */}
      <Line x1="5" y1="19" x2="19" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function DownloadArrowIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      {/* Vertical shaft */}
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Arrow head pointing down */}
      <Path
        d="M6 13l6 6 6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base line */}
      <Line x1="5" y1="5" x2="19" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
