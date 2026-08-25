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

  React.useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => undefined);
    return () => subscription.remove();
  }, []);

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
