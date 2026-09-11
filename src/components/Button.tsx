import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Text from './Text';
import { useAppTheme } from '../theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
}: Props) {
  const { theme } = useAppTheme();

  const containerStyle: ViewStyle = {
    backgroundColor:
      variant === 'primary'
        ? theme.colors.primary
        : theme.isDark
          ? theme.colors.surface
          : theme.colors.white,
    borderColor: variant === 'secondary' ? theme.colors.border : 'transparent',
    borderWidth: variant === 'secondary' ? 1 : 0,
    alignSelf: fullWidth ? 'stretch' : 'center',
  };

  const textColor = variant === 'primary' ? theme.colors.buttonText : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.container,
        containerStyle,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text variant="body" weight="medium" color={textColor}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 17,
    // shadow/sm
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
