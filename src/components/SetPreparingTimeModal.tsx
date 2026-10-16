import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './Text';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../localization/LocalizationProvider';

type Props = { visible: boolean; onClose: () => void; onDone: (minutes: number) => void };
const TIME_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function SetPreparingTimeModal({ visible, onClose, onDone }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations('app');
  const insets = useSafeAreaInsets();
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const close = () => {
    setSelectedTime(null);
    onClose();
  };
  const save = () => {
    if (selectedTime === null) return;
    onDone(selectedTime);
    setSelectedTime(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={[styles.overlay, { backgroundColor: theme.colors.modalBackdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel={t('cancel')} />
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface, paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
          <View style={styles.header}>
            <Text variant="subtitle" weight="bold" color={theme.colors.gray900} style={styles.title}>{t('set_preparing_time')}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t('cancel')} onPress={close} style={styles.close}>
              <Feather name="x" size={21} color={theme.colors.gray600} />
            </Pressable>
          </View>
          <Text variant="body" color={theme.colors.gray600}>{t('set_preparing_time_hint')}</Text>
          <View style={styles.grid}>
            {TIME_OPTIONS.map((minutes) => {
              const selected = minutes === selectedTime;
              return (
                <Pressable key={minutes} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setSelectedTime(minutes)} style={[styles.option, { backgroundColor: selected ? theme.colors.primary : theme.colors.gray50, borderColor: selected ? theme.colors.primary : theme.colors.gray200 }]}>
                  <Text variant="body" weight={selected ? 'bold' : 'medium'} color={selected ? theme.colors.buttonText : theme.colors.gray900}>{minutes} min</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable accessibilityRole="button" disabled={selectedTime === null} onPress={save} style={[styles.save, { backgroundColor: theme.colors.primary }, selectedTime === null && styles.disabled]}>
            <Text variant="body" weight="bold" color={theme.colors.buttonText}>{t('set_preparing_time_save')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  option: { width: '31%', minHeight: 48, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  save: { minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
});
