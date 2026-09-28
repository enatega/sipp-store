import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import apiClient from '../api/apiClient';
import Text from '../components/Text';
import { useAppTheme } from '../theme/ThemeProvider';
import type { MainStackParamList } from '../navigation/types';
import { useTranslations } from '../localization/LocalizationProvider';

type Props = NativeStackScreenProps<MainStackParamList, 'Notifications'>;
type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  data?: { orderId?: string } | null;
  deep_link?: string | null;
};
type NotificationPage = { data: NotificationItem[]; total: number };
const path = '/apps/deliveries/users-notifications';

export default function NotificationsScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations('app');
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const list = useQuery({
    queryKey: ['store-notifications', page],
    queryFn: () => apiClient.get<NotificationPage>(`${path}/user/me`, { page, limit: 20 }),
  });
  const markRead = useMutation({
    mutationFn: (id: string) => apiClient.patch(`${path}/mark-read/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['store-notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['store-notification-count'] });
    },
  });

  useEffect(() => {
    if (!list.data) return;
    const nextItems = list.data.data;
    setTotal(list.data.total);
    setItems((current) => page === 1
      ? nextItems
      : [...current.filter((item) => !nextItems.some((next) => next.id === item.id)), ...nextItems]);
  }, [list.data, page]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void queryClient.invalidateQueries({ queryKey: ['store-notifications'] });
    });
    return () => subscription.remove();
  }, [queryClient]);

  const openItem = (item: NotificationItem) => {
    if (!item.isRead) {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, isRead: true } : entry));
      markRead.mutate(item.id);
    }
    const orderId = item.data?.orderId ?? item.deep_link?.match(/^\/orders\/([0-9a-f-]{36})$/i)?.[1];
    if (orderId) navigation.navigate('StoreOrderDetail', { orderId });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.gray100 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Go back" style={styles.back}>
          <Feather name="arrow-left" size={22} color={theme.colors.gray900} />
        </Pressable>
        <Text weight="semiBold" style={[styles.title, { color: theme.colors.gray900 }]}>{t('notifications_title')}</Text>
      </View>
      {list.isLoading && items.length === 0 ? <ActivityIndicator style={styles.loading} color={theme.colors.primary} /> : null}
      {list.isError && items.length === 0 ? (
        <Pressable onPress={() => void list.refetch()} style={styles.empty}>
          <Text style={{ color: theme.colors.gray900 }}>{t('notifications_retry')}</Text>
        </Pressable>
      ) : null}
      {!list.isLoading && !list.isError && items.length === 0 ? (
        <View style={styles.empty}><Text style={{ color: theme.colors.gray600 }}>{t('notifications_empty')}</Text></View>
      ) : null}
      <ScrollView contentContainerStyle={styles.list}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => openItem(item)} style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.gray300 }]}>
            <View style={[styles.dot, { backgroundColor: item.isRead ? 'transparent' : theme.colors.primary }]} />
            <View style={styles.rowText}>
              <Text weight="semiBold" style={{ color: theme.colors.gray900 }}>{item.title}</Text>
              <Text style={[styles.description, { color: theme.colors.gray600 }]}>{item.description}</Text>
              <Text style={[styles.date, { color: theme.colors.gray600 }]}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            {item.data?.orderId ? <Feather name="chevron-right" size={18} color={theme.colors.gray600} /> : null}
          </Pressable>
        ))}
        {items.length < total || (list.isError && items.length > 0) ? (
          <Pressable onPress={() => { if (list.isError) void list.refetch(); else setPage((current) => current + 1); }} style={styles.more} disabled={list.isFetching}>
            <Text weight="semiBold" color={theme.colors.primary}>{t(list.isError ? 'notifications_retry' : list.isFetching ? 'notifications_loading' : 'notifications_more')}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, header: { height: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 22 },
  loading: { marginTop: 36 }, empty: { padding: 32, alignItems: 'center' }, list: { padding: 20, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 }, rowText: { flex: 1 }, description: { marginTop: 4 }, date: { marginTop: 8, fontSize: 12 },
  more: { alignItems: 'center', padding: 16 },
});
