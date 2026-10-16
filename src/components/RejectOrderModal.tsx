import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './Text';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../localization/LocalizationProvider';

type Props = {
  visible: boolean;
  orderCode?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

const MAX_REASON_LENGTH = 200;

export default function RejectOrderModal({ visible, orderCode, isSubmitting, onClose, onConfirm }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations('app');
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const suggestedReasons = useMemo(() => [
    t('reject_reason_item_out_of_stock'),
    t('reject_reason_kitchen_busy'),
    t('reject_reason_cannot_deliver'),
    t('reject_reason_ingredient_unavailable'),
    t('reject_reason_closing_soon'),
    t('reject_reason_order_too_large'),
    t('reject_reason_other'),
  ], [t]);
  const isCustom = selectedReason === t('reject_reason_other');
  const reason = (isCustom ? customReason : selectedReason).trim();

  useEffect(() => {
    if (visible) return;
    setSelectedReason('');
    setCustomReason('');
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.overlay, { backgroundColor: theme.colors.modalBackdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('cancel')} />
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface, paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text variant="subtitle" weight="bold" color={theme.colors.gray900}>{t('reject_modal_title')}</Text>
              {orderCode ? <Text variant="caption" color={theme.colors.gray600}>{orderCode}</Text> : null}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('cancel')} disabled={isSubmitting} onPress={onClose} style={styles.close}>
              <Feather name="x" size={21} color={theme.colors.gray600} />
            </Pressable>
          </View>
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
            <Text variant="body" weight="semiBold" color={theme.colors.gray900}>{t('reject_modal_suggested_reasons')}</Text>
            <View style={styles.chips}>
              {suggestedReasons.map((option) => {
                const selected = selectedReason === option;
                return (
                  <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected }} disabled={isSubmitting} onPress={() => setSelectedReason(option)} style={[styles.chip, { borderColor: selected ? theme.colors.primary : theme.colors.gray200, backgroundColor: selected ? theme.colors.green50 : theme.colors.surface }]}>
                    <Text variant="caption" weight={selected ? 'semiBold' : 'medium'} color={theme.colors.gray900}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
            {isCustom ? (
              <View style={styles.customArea}>
                <TextInput
                  value={customReason}
                  onChangeText={(value) => setCustomReason(value.slice(0, MAX_REASON_LENGTH))}
                  placeholder={t('reject_modal_reason_placeholder')}
                  placeholderTextColor={theme.colors.gray600}
                  multiline
                  maxLength={MAX_REASON_LENGTH}
                  editable={!isSubmitting}
                  style={[styles.input, { color: theme.colors.gray900, borderColor: theme.colors.gray300 }]}
                  textAlignVertical="top"
                />
                <Text variant="caption" color={theme.colors.gray600} style={styles.counter}>{customReason.length}/{MAX_REASON_LENGTH}</Text>
              </View>
            ) : null}
          </ScrollView>
          <Pressable accessibilityRole="button" disabled={!reason || isSubmitting} onPress={() => onConfirm(reason)} style={[styles.confirm, { backgroundColor: theme.colors.red800 }, (!reason || isSubmitting) && styles.disabled]}>
            <Text variant="body" weight="bold" color={theme.colors.white}>{t('reject_modal_confirm')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '85%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerCopy: { flex: 1, gap: 3 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 0 },
  body: { gap: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center' },
  customArea: { gap: 6 },
  input: { borderWidth: 1, borderRadius: 12, minHeight: 90, padding: 12, fontSize: 14, lineHeight: 20 },
  counter: { textAlign: 'right' },
  confirm: { minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
});
