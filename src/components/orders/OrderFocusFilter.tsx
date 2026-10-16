import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Text from '../Text';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../localization/LocalizationProvider';

type Props = {
  orderCode: string;
  onClear: () => void;
};

export default function OrderFocusFilter({ orderCode, onClear }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations('app');
  const foreground = theme.isDark ? theme.colors.text : theme.colors.sky600;

  return (
    <View style={styles.row}>
      <View
        style={[styles.pill, { backgroundColor: theme.isDark ? theme.colors.gray200 : theme.colors.sky100 }]}
      >
        <Feather name="filter" size={15} color={foreground} />
        <Text style={[styles.code, { color: foreground }]} weight="semiBold">{orderCode}</Text>
        <View style={[styles.separator, { backgroundColor: foreground }]} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('orders_focus_clear_accessibility')}
          onPress={onClear}
          hitSlop={8}
          style={styles.clear}
        >
          <Feather name="x" size={18} color={foreground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 8 },
  pill: { minHeight: 40, borderRadius: 20, paddingLeft: 12, paddingRight: 4, flexDirection: 'row', alignItems: 'center', gap: 8 },
  code: { fontSize: 14, lineHeight: 18 },
  separator: { width: StyleSheet.hairlineWidth, height: 18, opacity: 0.35 },
  clear: { width: 32, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
});
