import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './Text';
import { useTranslations } from '../localization/LocalizationProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import HomeIcon from './icons/HomeIcon';
import WalletIcon from './icons/WalletIcon';
import EarningsIcon from './icons/EarningsIcon';
import ProfileIcon from './icons/ProfileIcon';

const ROUTE_META = {
  HomeTab: { key: 'nav_home', Icon: HomeIcon },
  WalletTab: { key: 'nav_wallet', Icon: WalletIcon },
  EarningsTab: { key: 'nav_earnings', Icon: EarningsIcon },
  ProfileTab: { key: 'nav_profile', Icon: ProfileIcon },
} as const;

export default function BottomTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { t } = useTranslations('app');
  const { theme } = useAppTheme();
  const bottomInset = Math.max(insets.bottom + 6, 16);
  const containerHeight = 62 + bottomInset;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: 12,
          paddingBottom: bottomInset,
          minHeight: containerHeight,
          backgroundColor: theme.colors.gray200,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isActive = state.index === index;
        const meta = ROUTE_META[route.name as keyof typeof ROUTE_META];
        const Icon = meta?.Icon ?? HomeIcon;
        const label = t(meta?.key ?? 'nav_home');

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
          >
            <View style={styles.iconWrapper}>
              <Icon active={isActive} />
            </View>
            <Text
              variant="caption"
              style={[
                styles.label,
                { color: isActive ? theme.colors.primary : theme.colors.gray400 },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    minWidth: 70,
    flex: 1,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
