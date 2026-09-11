import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from './Text';
import { useAppTheme } from '../theme/ThemeProvider';

export type TabItem<T extends string> = {
  key: T;
  label: string;
  badgeCount?: number;
};

type Props<T extends string> = {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabPress: (key: T) => void;
};

/**
 * Horizontally scrollable tab bar with green underline indicator.
 * The gray base line runs full width; the green indicator overlaps it at the bottom.
 */
export default function TabBar<T extends string>({ tabs, activeTab, onTabPress }: Props<T>) {
  const { theme } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.gray200 }]}
      contentContainerStyle={styles.content}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              variant="caption"
              weight={isActive ? 'semiBold' : 'regular'}
              color={isActive ? theme.colors.gray900 : theme.colors.gray500}
              style={[styles.label, isActive && styles.labelActive]}
            >
              {tab.label}
            </Text>
            {typeof tab.badgeCount === 'number' ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.gray200,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  color={isActive ? theme.colors.buttonText : theme.colors.gray600}
                  style={styles.badgeText}
                >
                  {tab.badgeCount}
                </Text>
              </View>
            ) : null}

            {/* Green indicator — absolutely positioned at the very bottom, overlapping the gray border */}
            {isActive && (
              <View
                style={[
                  styles.indicator,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
    // relative so the absolute indicator is anchored to this tab
    position: 'relative',
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
