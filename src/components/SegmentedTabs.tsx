import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import Text from "./Text";
import { useAppTheme } from "../theme/ThemeProvider";

export type TabItem = {
  key: string;
  label: string;
};

type Props = {
  tabs: TabItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
  disabled?: boolean;
};

export default function SegmentedTabs({
  tabs,
  activeKey,
  onTabPress,
  disabled = false,
}: Props) {
  const { theme } = useAppTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Find the index of the active tab
  const activeIndex = useMemo(
    () => tabs.findIndex((t) => t.key === activeKey),
    [tabs, activeKey],
  );

  // Trigger the animation whenever the active index changes
  useEffect(() => {
    Animated.spring(scrollX, {
      toValue: activeIndex,
      useNativeDriver: true, // Use native driver for 60fps performance
      bounciness: 4,
    }).start();
  }, [activeIndex]);

  const onLayout = (e: LayoutChangeEvent) => {
    // We subtract padding to get the actual track width
    setContainerWidth(e.nativeEvent.layout.width - 32);
  };

  // Calculate the width of a single tab and the sliding distance
  const tabWidth = containerWidth / tabs.length;
  const translateX = scrollX.interpolate({
    inputRange: [0, tabs.length - 1],
    outputRange: [0, (tabs.length - 1) * tabWidth],
  });

  return (
    <View
      style={[styles.container, { backgroundColor: "transparent" }]}
      onLayout={onLayout}
    >
      {/* The Sliding Indicator */}
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.slidingIndicator,
            {
              width: tabWidth,
              backgroundColor: theme.colors.primary,
              transform: [{ translateX }],
            },
          ]}
        />
      )}

      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={styles.flexTab}
            onPress={() => !disabled && onTabPress(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <View style={styles.tabContent}>
              <Text style={[styles.label, { color: theme.colors.gray600 }]}>
                {tab.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flexTab: {
    flex: 1,
  },
  slidingIndicator: {
    position: "absolute",
    top: 12,
    bottom: 12,
    left: 16,
    borderRadius: 8,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    flexDirection: "row",
  },
  label: {
    fontSize: 16,
  },
});
