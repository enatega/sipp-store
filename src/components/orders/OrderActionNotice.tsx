import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeProvider';
import Text from '../Text';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  buttonLabel: string;
  tone: 'success' | 'warning' | 'error';
  orderCode?: string;
  onClose: () => void;
};

export default function OrderActionNotice({ visible, title, message, buttonLabel, tone, orderCode, onClose }: Props) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const accent = tone === 'error' ? theme.colors.red500 : tone === 'warning' ? theme.colors.amber800 : theme.colors.green600;
  const tint = tone === 'error' ? theme.colors.gray50 : tone === 'warning' ? theme.colors.amber100 : theme.colors.green50;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.modalBackdrop, paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={buttonLabel} />
        <View style={[styles.card, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          <View style={[styles.icon, { backgroundColor: tint }]}>
            <Feather name={tone === 'error' ? 'alert-circle' : tone === 'warning' ? 'info' : 'check'} size={25} color={accent} />
          </View>
          {orderCode ? <Text variant="caption" weight="semiBold" color={theme.colors.gray600} style={styles.code}>#{orderCode.replace(/^#/, '')}</Text> : null}
          <Text variant="subtitle" weight="bold" color={theme.colors.gray900} style={styles.title}>{title}</Text>
          <Text variant="label" color={theme.colors.gray600} style={styles.message}>{message}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" style={[styles.button, { backgroundColor: theme.colors.primary }]}>
            <Text variant="label" weight="bold" color={theme.colors.buttonText}>{buttonLabel}</Text>
            <Feather name="arrow-right" size={18} color={theme.colors.buttonText} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 16 },
  card: { width: '100%', maxWidth: 480, alignSelf: 'center', borderRadius: 20, padding: 22, shadowOpacity: 0.16, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  icon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  code: { marginTop: 14 },
  title: { marginTop: 5 },
  message: { marginTop: 7, lineHeight: 21 },
  button: { minHeight: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 22 },
});
