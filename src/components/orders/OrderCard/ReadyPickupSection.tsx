import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslations } from '../../../localization/LocalizationProvider';
import type { Theme } from '../../../theme/theme';
import { OrderStatus } from '../../../api/orderServicesTypes';
import Text from '../../Text';

type Props = {
  status: OrderStatus;
  orderId: string;
  onConfirmPickup?: (orderId: string) => void;
  showConfirmButton?: boolean;
  isConfirmingPickup?: boolean;
  theme: Theme;
};

export default function ReadyPickupSection({ status, orderId, onConfirmPickup, showConfirmButton, isConfirmingPickup, theme }: Props) {
  const { t } = useTranslations('app');
  if (!showConfirmButton) return null;
  const isPickedUp = status === OrderStatus.PICKED_UP;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onConfirmPickup?.(orderId)}
      disabled={isConfirmingPickup}
      style={[styles.button, { backgroundColor: theme.colors.primary }, isConfirmingPickup && styles.busy]}
    >
      {isConfirmingPickup ? <ActivityIndicator size="small" color={theme.colors.buttonText} /> : (
        <View style={styles.content}>
          <Feather name="check-circle" size={19} color={theme.colors.buttonText} />
          <Text weight="semiBold" color={theme.colors.buttonText}>{t(isPickedUp ? 'order_card_mark_delivered' : 'order_card_confirm_pickup')}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  busy: { opacity: 0.6 },
});
