import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './Text';
import { useAppTheme } from '../theme/ThemeProvider';

type Props = {
  title: string;
  onBack?: () => void;
  onMenuPress?: () => void;
  rightElement?: React.ReactNode;
};

/**
 * Reusable screen header.
 * - Pass `onMenuPress` to show a hamburger (≡) on the left — used on Home.
 * - Pass `onBack` to show a back chevron on the left — used on inner screens.
 * - `rightElement` fills the right slot.
 */
export default function ScreenHeader({ title, onBack, onMenuPress, rightElement }: Props) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Left slot */}
      <View style={styles.side}>
        {onMenuPress ? (
          <Pressable
            onPress={onMenuPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <HamburgerIcon color={theme.colors.text} />
          </Pressable>
        ) : onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackIcon color={theme.colors.text} />
          </Pressable>
        ) : null}
      </View>

      {/* Center title */}
      <View style={styles.center}>
        <Text variant="body" weight="bold" color={theme.colors.text} numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </View>

      {/* Right slot */}
      <View style={styles.side}>{rightElement ?? null}</View>
    </View>
  );
}

function HamburgerIcon({ color }: { color: string }) {
  return (
    <View style={styles.hamburger}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={[styles.bar, styles.barMid, { backgroundColor: color }]} />
      <View style={[styles.bar, { backgroundColor: color }]} />
    </View>
  );
}

function BackIcon({ color }: { color: string }) {
  return (
    <View style={styles.backIcon}>
      <View style={[styles.chevronLeft, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  side: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
  },
  // Hamburger
  hamburger: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    gap: 4,
  },
  bar: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  barMid: {
    width: 14,
  },
  // Back chevron
  backIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronLeft: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
});
