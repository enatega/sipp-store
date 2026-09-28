import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslations } from '../../../localization/LocalizationProvider';
import type { Theme } from '../../../theme/theme';
import CountdownTimer from '../../CountdownTimer';
import Text from '../../Text';

type Props = {
  orderId: string;
  preparingTimeInMinutes: number;
  remainingSeconds?: number | null;
  startTime: number | null;
  onMarkReady: (orderId: string) => void;
  onUpdatePreparingTime: (orderId: string, minutes: number) => void;
  canMarkReady: boolean;
  isMarkingReady?: boolean;
  isUpdatingTime?: boolean;
  theme: Theme;
};

export default function InProgressSection({ orderId, preparingTimeInMinutes, remainingSeconds, startTime, onMarkReady, onUpdatePreparingTime, canMarkReady, isMarkingReady, isUpdatingTime, theme }: Props) {
  const { t } = useTranslations('app');
  const initialSeconds = useMemo(() => typeof remainingSeconds === 'number' && (remainingSeconds > 0 || preparingTimeInMinutes <= 0)
    ? Math.max(0, remainingSeconds)
    : Math.max(0, preparingTimeInMinutes * 60), [preparingTimeInMinutes, remainingSeconds]);
  const [liveSeconds, setLiveSeconds] = useState(initialSeconds);

  useEffect(() => { setLiveSeconds(initialSeconds); }, [initialSeconds, orderId]);

  return (
    <View style={styles.section}>
      <View style={[styles.timer, { backgroundColor: theme.colors.green50 }]}>
        <View style={styles.timerLabel}>
          <Feather name="clock" size={18} color={theme.colors.green600} />
          <Text weight="semiBold" color={theme.colors.green600}>{t('order_card_preparing')}</Text>
        </View>
        <CountdownTimer startTimeMs={startTime} totalMinutes={preparingTimeInMinutes} remainingSecondsOverride={liveSeconds} style={[styles.timerValue, { color: theme.colors.green600 }]} />
      </View>
      {!canMarkReady ? <Text variant="caption" color={theme.colors.gray600}>{t('order_card_wait_for_rider')}</Text> : null}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('order_card_add_five_minutes')}
          onPress={() => {
            const minutes = (preparingTimeInMinutes || 0) + 5;
            setLiveSeconds((seconds) => Math.max(0, seconds) + 300);
            onUpdatePreparingTime(orderId, minutes);
          }}
          disabled={isUpdatingTime}
          style={[styles.addTime, { borderColor: theme.colors.gray200, backgroundColor: theme.colors.surface }, isUpdatingTime && styles.busy]}
        >
          {isUpdatingTime ? <ActivityIndicator size="small" color={theme.colors.gray900} /> : <Text weight="semiBold" color={theme.colors.gray900}>{t('order_card_plus_five')}</Text>}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onMarkReady(orderId)}
          disabled={isMarkingReady || !canMarkReady}
          style={[styles.markReady, { backgroundColor: canMarkReady ? theme.colors.primary : theme.colors.gray300 }, (isMarkingReady || !canMarkReady) && styles.busy]}
        >
          {isMarkingReady ? <ActivityIndicator size="small" color={theme.colors.buttonText} /> : <Text weight="semiBold" color={canMarkReady ? theme.colors.buttonText : theme.colors.gray600}>{t('order_card_mark_ready')}</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  timer: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  timerLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerValue: { fontSize: 20, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
  addTime: { minWidth: 88, height: 46, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  markReady: { flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  busy: { opacity: 0.6 },
});
