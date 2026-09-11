import React, { useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import Text from './Text';

type Props = RNTextInputProps & {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
};

export default function TextInput({
  label,
  error,
  rightIcon,
  containerStyle,
  isPassword = false,
  secureTextEntry,
  ...rest
}: Props) {
  const { theme } = useAppTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isSecure = isPassword ? !passwordVisible : secureTextEntry;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text variant="caption" weight="medium" style={styles.label} color={theme.colors.gray900}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? '#EF4444' : theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <RNTextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: 16,
              flex: 1,
            },
          ]}
          placeholderTextColor={theme.colors.mutedText}
          secureTextEntry={isSecure}
          {...rest}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setPasswordVisible((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
          >
            <EyeIcon visible={passwordVisible} color={theme.colors.mutedText} />
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.iconWrapper}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color="#EF4444" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// Inline SVG-free eye icon using simple shapes
function EyeIcon({ visible, color }: { visible: boolean; color: string }) {
  return (
    <View style={styles.eyeIcon}>
      {/* Outer eye shape */}
      <View
        style={[
          styles.eyeOuter,
          { borderColor: color },
        ]}
      />
      {/* Pupil */}
      <View
        style={[
          styles.eyePupil,
          { backgroundColor: color },
        ]}
      />
      {/* Slash line when hidden */}
      {!visible && (
        <View
          style={[
            styles.eyeSlash,
            { backgroundColor: color },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 17,
    paddingVertical: 9,
    gap: 6,
    // shadow/sm
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    padding: 0,
    margin: 0,
    minHeight: 24,
  },
  iconWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 2,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOuter: {
    width: 16,
    height: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    position: 'absolute',
  },
  eyePupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
    position: 'absolute',
  },
  eyeSlash: {
    width: 1.5,
    height: 20,
    borderRadius: 1,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
});
