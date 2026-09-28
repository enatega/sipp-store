import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { Platform, StyleSheet, View } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';
import QueryProvider from './src/providers/QueryProvider';
import { LocalizationProvider } from './src/localization/LocalizationProvider';
import { AuthProvider } from './src/auth/AuthProvider';
import { usePushTokenSync } from './src/hooks/usePushTokenSync';
import { queueOrderNotificationNavigation } from './src/navigation/notificationNavigation';
import { useQueryClient } from '@tanstack/react-query';
import './src/localization/i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function ThemedApp() {
  const { theme } = useAppTheme();
  usePushTokenSync();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ['store-notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['store-notification-count'] });
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
  }, [queryClient]);

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
});
