import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../localization/LocalizationProvider';
import Text from '../Text';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  tone: 'success' | 'warning' | 'error';
  orderCode?: string;
  onClose: () => void;
};

export default function OrderActionNotice({ visible, title, message, tone, orderCode, onClose }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations('app');
  const insets = useSafeAreaInsets();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => onCloseRef.current(), tone === 'warning' ? 6000 : 3500);
    return () => clearTimeout(timeout);
  }, [visible, tone, title, orderCode]);

  if (!visible) return null;
  const accent = tone === 'error' ? theme.colors.red500 : tone === 'warning' ? theme.colors.amber800 : theme.colors.green600;
  const code = orderCode?.replace(/^#/, '');

  return (
    <View pointerEvents="box-none" style={[styles.overlay, { bottom: Math.max(insets.bottom, 8) + 8 }]}>
      <View style={[styles.notice, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]} accessibilityRole="alert">
        <Feather name={tone === 'error' ? 'alert-circle' : tone === 'warning' ? 'clock' : 'check-circle'} size={20} color={accent} />
        <View style={styles.copy}>
          <Text variant="body" weight="semiBold" color={theme.colors.gray900} numberOfLines={2}>{title}</Text>
          {tone !== 'success' ? <Text variant="caption" color={theme.colors.gray600} numberOfLines={2}>{message}</Text> : null}
          {code ? <Text variant="caption" color={theme.colors.gray600}>#{code}</Text> : null}
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('order_flow_dismiss')} hitSlop={8} style={styles.dismiss}>
          <Feather name="x" size={18} color={theme.colors.gray600} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', left: 16, right: 16, zIndex: 20, alignItems: 'center' },
  notice: { width: '100%', maxWidth: 480, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 12, shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  copy: { flex: 1, gap: 2 },
  dismiss: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginTop: -6, marginRight: -6 },
});
