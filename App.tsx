import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';
import QueryProvider from './src/providers/QueryProvider';
import { LocalizationProvider } from './src/localization/LocalizationProvider';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import { usePushTokenSync } from './src/hooks/usePushTokenSync';
import { queueOrderNotificationNavigation } from './src/navigation/notificationNavigation';
import { useQueryClient } from '@tanstack/react-query';
import './src/localization/i18n';
import { useTranslations } from './src/localization/LocalizationProvider';
import { alertForNewStoreOrder, subscribeStoreOrderAlerts } from './src/hooks/orderAlertCoordinator';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => ({
    shouldPlaySound: notification.request.content.data?.type !== 'new_order',
    shouldSetBadge: false,
    shouldShowBanner: notification.request.content.data?.type !== 'new_order',
    shouldShowList: notification.request.content.data?.type !== 'new_order',
  }),
});

function ThemedApp() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { t } = useTranslations('app');
  const [newOrderNotice, setNewOrderNotice] = React.useState<string | null>(null);
  usePushTokenSync();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((notification) => {
      void queryClient.invalidateQueries({ queryKey: ['store-notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['store-notification-count'] });
      const data = notification.request.content.data;
      if (data?.type === 'new_order' && typeof data.orderId === 'string' && session.user?.id) {
        void alertForNewStoreOrder({
          userId: session.user.id,
          orderId: data.orderId,
          occurredAt: typeof data.sentAt === 'string' ? data.sentAt : '',
        });
      }
    });
    const openOrder = (response: Notifications.NotificationResponse | null) => {
      queueOrderNotificationNavigation(response?.notification.request.content.data?.orderId);
    };
    const opened = Notifications.addNotificationResponseReceivedListener(openOrder);
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      openOrder(response);
      void Notifications.clearLastNotificationResponseAsync();
    }).catch(() => undefined);
    return () => { received.remove(); opened.remove(); };
  }, [queryClient, session.user?.id]);

  React.useEffect(() => subscribeStoreOrderAlerts(setNewOrderNotice), []);
  React.useEffect(() => {
    if (!session.token) setNewOrderNotice(null);
  }, [session.token]);
  React.useEffect(() => {
    if (!newOrderNotice) return;
    const timeout = setTimeout(() => setNewOrderNotice(null), 6000);
    return () => clearTimeout(timeout);
  }, [newOrderNotice]);

  React.useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const syncNavigationBar = async () => {
      await NavigationBar.setButtonStyleAsync(theme.isDark ? 'light' : 'dark');
    };

    void syncNavigationBar();
  }, [theme.isDark]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top', 'left', 'right']}
      >
        <RootNavigator />
        {newOrderNotice && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              queueOrderNotificationNavigation(newOrderNotice);
              setNewOrderNotice(null);
            }}
            style={[styles.orderNotice, {
              top: insets.top + 8,
              left: insets.left + 16,
              right: insets.right + 16,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.sky600,
            }]}
          >
            <Text style={[styles.orderNoticeTitle, { color: theme.colors.gray900 }]}>{t('orders_tab_new')}</Text>
            <Text style={{ color: theme.colors.gray900 }}>#{newOrderNotice.slice(0, 8).toUpperCase()}</Text>
          </Pressable>
        )}
      </SafeAreaView>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <LocalizationProvider>
            <AuthProvider>
              <ThemedApp />
            </AuthProvider>
          </LocalizationProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderNotice: {
    position: 'absolute', zIndex: 30,
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    elevation: 4,
  },
  orderNoticeTitle: { fontWeight: '700', marginBottom: 2 },
});
