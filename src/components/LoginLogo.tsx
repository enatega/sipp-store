import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';

/**
 * Logo mark shown at the top of the Login screen.
 * Matches the Figma "Size=Lg" icon placeholder (32×32).
 */
export default function LoginLogo() {
  const { theme } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.outer, { backgroundColor: theme.colors.primary }]}>
        <View style={[styles.inner, { backgroundColor: theme.colors.gray900 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  outer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
});
