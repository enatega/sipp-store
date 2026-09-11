import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './Text';
import { useAppTheme } from '../theme/ThemeProvider';

export type SelectOption = {
  value: string;
  label: string;
  /** Optional emoji flag or short prefix shown left of the label */
  prefix?: string;
};

type Props = {
  label?: string;
  value: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Reusable select field.
 * Tapping opens a bottom-sheet modal with all options listed.
 * Selected option shows prefix (e.g. flag emoji) + label + chevron.
 */
export default function SelectField({
  label,
  value,
  options,
  onSelect,
  error,
  containerStyle,
}: Props) {
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const selected = options.find((o) => o.value === value) ?? options[0];

  const handleSelect = (val: string) => {
    onSelect(val);
    setOpen(false);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text variant="caption" weight="medium" color={theme.colors.gray900} style={styles.label}>
          {label}
        </Text>
      ) : null}

      {/* Trigger */}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [
          styles.field,
          {
            borderColor: error ? '#EF4444' : theme.colors.border,
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        {selected.prefix ? (
          <Text style={styles.prefix}>{selected.prefix}</Text>
        ) : null}
        <Text variant="body" color={theme.colors.text} style={styles.selectedLabel}>
          {selected.label}
        </Text>
        <View style={[styles.chevron, { borderColor: theme.colors.mutedText }]} />
      </Pressable>

      {error ? (
        <Text variant="caption" color="#EF4444" style={styles.error}>
          {error}
        </Text>
      ) : null}

      {/* Bottom-sheet modal */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop — tap to dismiss */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        {/* Sheet */}
        <View style={[styles.sheet, { backgroundColor: theme.colors.background }]}>
          {/* Handle bar */}
          <View style={[styles.handle, { backgroundColor: theme.colors.gray300 }]} />

          {/* Sheet title */}
          {label ? (
            <Text
              variant="body"
              weight="semiBold"
              color={theme.colors.text}
              style={styles.sheetTitle}
            >
              {label}
            </Text>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.optionsList, { paddingBottom: insets.bottom + 16 }]}
          >
            {options.map((option, idx) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    {
                      borderBottomColor: theme.colors.gray200,
                      borderBottomWidth: idx < options.length - 1 ? 1 : 0,
                      backgroundColor: pressed ? theme.colors.gray200 : 'transparent',
                    },
                  ]}
                >
                  {option.prefix ? (
                    <Text style={styles.optionPrefix}>{option.prefix}</Text>
                  ) : null}
                  <Text
                    variant="body"
                    weight={isSelected ? 'semiBold' : 'regular'}
                    color={isSelected ? theme.colors.primary : theme.colors.text}
                    style={styles.optionLabel}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkDot, { backgroundColor: theme.colors.primary }]} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
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
  // Trigger
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 17,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  prefix: {
    fontSize: 20,
  },
  selectedLabel: {
    flex: 1,
    fontSize: 16,
  },
  chevron: {
    width: 9,
    height: 9,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginTop: -4,
  },
  error: {
    marginTop: 2,
  },
  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  optionPrefix: {
    fontSize: 22,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
