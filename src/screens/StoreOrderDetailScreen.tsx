import React, { useEffect } from 'react';
import { ActivityIndicator, AppState, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import apiClient from '../api/apiClient';
import { useAuth } from '../auth/AuthProvider';
import Text from '../components/Text';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../localization/LocalizationProvider';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'StoreOrderDetail'>;
type Detail = {
  orderSummary?: { orderId: string; status: string; orderAmount: number; paymentMethod?: string };
  items?: { products?: Array<{ itemName: string; quantity: number; finalPrice: number }> };
  customerInfo?: { name?: string };
  riderInfo?: { name?: string };
  deliveryInfo?: { pickupAddress?: string; dropoffAddress?: string };
  statusTimeline?: Array<{ status: string; timestamp: string; message?: string }>;
};

const statusKeys: Record<string, string> = {
  scheduled: 'notification_status_scheduled', pending: 'notification_status_pending',
  accepted: 'notification_status_accepted', preparing: 'notification_status_preparing',
  ready: 'notification_status_ready', rider_assigned: 'notification_status_rider_assigned',
  picked_up: 'notification_status_picked_up', out_for_delivery: 'notification_status_out_for_delivery',
  arrived: 'notification_status_arrived', delivered: 'notification_status_delivered',
  cancelled: 'notification_status_cancelled', rejected: 'notification_status_rejected',
  failed: 'notification_status_failed',
};

export default function StoreOrderDetailScreen({ route, navigation }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations('app');
  const { session } = useAuth();
  const storeId = session.profiles?.find((entry) => entry.key === 'Store')?.data?.id;
  const { orderId } = route.params;
  const detail = useQuery({
    queryKey: ['store-order-detail', orderId],
    queryFn: () => apiClient.get<Detail>(`/apps/deliveries/store/orders/${storeId}/order/${orderId}`),
    enabled: Boolean(storeId && orderId),
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && storeId) void detail.refetch();
    });
    return () => subscription.remove();
  }, [detail.refetch, storeId]);

  const summary = detail.data?.orderSummary;
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.gray100 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Go back" style={styles.back}>
          <Feather name="arrow-left" size={22} color={theme.colors.gray900} />
        </Pressable>
        <Text weight="semiBold" style={[styles.title, { color: theme.colors.gray900 }]}>{t('notification_order_detail')}</Text>
      </View>
      {detail.isLoading ? <ActivityIndicator style={styles.loading} color={theme.colors.primary} /> : null}
      {detail.isError || !storeId ? (
        <Pressable onPress={() => { if (storeId) void detail.refetch(); }} style={styles.empty}>
          <Text style={{ color: theme.colors.gray900 }}>{t('notification_order_retry')}</Text>
        </Pressable>
      ) : null}
      {detail.data ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.gray300 }]}>
            <Text style={{ color: theme.colors.gray600 }}>{t('notification_order_number')} {orderId.slice(0, 8).toUpperCase()}</Text>
            <Text weight="semiBold" style={[styles.status, { color: theme.colors.gray900 }]}>{summary?.status ? t(statusKeys[summary.status] ?? 'notification_status_pending') : '—'}</Text>
            <Text weight="semiBold" style={[styles.amount, { color: theme.colors.primary }]}>₡ {Number(summary?.orderAmount ?? 0).toLocaleString()}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.gray300 }]}>
            <Text weight="semiBold" style={[styles.section, { color: theme.colors.gray900 }]}>{t('notification_order_items')}</Text>
            {detail.data.items?.products?.map((item, index) => (
              <View key={`${item.itemName}-${index}`} style={styles.line}>
                <Text style={[styles.flex, { color: theme.colors.gray900 }]}>{item.quantity} × {item.itemName}</Text>
                <Text style={{ color: theme.colors.gray900 }}>₡ {Number(item.finalPrice ?? 0).toLocaleString()}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.gray300 }]}>
            <Text weight="semiBold" style={[styles.section, { color: theme.colors.gray900 }]}>{t('notification_order_people')}</Text>
            <Text style={{ color: theme.colors.gray900 }}>{t('notification_order_customer')}: {detail.data.customerInfo?.name || '—'}</Text>
            <Text style={{ color: theme.colors.gray900 }}>{t('notification_order_rider')}: {detail.data.riderInfo?.name || '—'}</Text>
            {detail.data.deliveryInfo?.pickupAddress ? <Text style={{ color: theme.colors.gray600 }}>{detail.data.deliveryInfo.pickupAddress}</Text> : null}
            {detail.data.deliveryInfo?.dropoffAddress ? <Text style={{ color: theme.colors.gray600 }}>{detail.data.deliveryInfo.dropoffAddress}</Text> : null}
          </View>
          <Pressable onPress={() => navigation.navigate('Home', { screen: 'HomeTab' })} style={[styles.action, { backgroundColor: theme.colors.primary }]}>
            <Text weight="semiBold" style={{ color: '#FFFFFF' }}>{t('notification_order_manage')}</Text>
          </Pressable>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, header: { height: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 22 },
  loading: { marginTop: 36 }, empty: { padding: 32, alignItems: 'center' }, content: { padding: 20, gap: 14, paddingBottom: 48 },
  card: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 10 }, status: { fontSize: 22, textTransform: 'capitalize' }, amount: { fontSize: 24 },
  section: { fontSize: 18 }, line: { flexDirection: 'row', gap: 12 }, flex: { flex: 1 },
  action: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
