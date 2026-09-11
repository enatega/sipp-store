import React from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "../Text";
import ToggleSwitch from "../ToggleSwitch";
import { useAppTheme } from "../../theme/ThemeProvider";
import { useSidebar } from "../../hooks/useSidebar";
import { styles, iconStyles, DRAWER_WIDTH } from "./sidebarStyles";

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: "Language" | "BankManagement" | "WorkSchedule") => void;
  onSwitchTab?: (tab: "Profile") => void;
};

// ─── Icons (inline SVG‑free) ──────────────────────────────────────────────────
function IconBox({ children }: { children: React.ReactNode }) {
  return <View style={styles.iconBox}>{children}</View>;
}

function ChevronRight({ color }: { color: string }) {
  return <View style={[styles.chevron, { borderColor: color }]} />;
}

function ClockIcon() {
  return (
    <View style={iconStyles.base}>
      <View style={iconStyles.clockOuter} />
      <View style={iconStyles.clockHand} />
    </View>
  );
}

function LanguageIcon() {
  return (
    <View style={iconStyles.base}>
      <View style={iconStyles.langLine1} />
      <View style={iconStyles.langLine2} />
      <View style={iconStyles.langLine3} />
    </View>
  );
}

function BankIcon() {
  return (
    <View style={iconStyles.base}>
      <View style={iconStyles.bankTop} />
      <View style={iconStyles.bankBottom} />
    </View>
  );
}

function ScheduleIcon() {
  return (
    <View style={iconStyles.base}>
      <View style={iconStyles.scheduleOuter} />
      <View style={iconStyles.scheduleInner} />
    </View>
  );
}

function ProfileMenuIcon() {
  return (
    <View style={iconStyles.base}>
      <View style={iconStyles.profileHead} />
      <View style={iconStyles.profileBody} />
    </View>
  );
}

function ShieldIcon() {
  return (
    <View style={iconStyles.base}>
      <View style={iconStyles.shield} />
    </View>
  );
}

function InfoIcon() {
  return (
    <View style={iconStyles.base}>
      <View style={iconStyles.infoCircle} />
    </View>
  );
}

function HelpIcon() {
  return (
    <View style={iconStyles.base}>
      <View style={iconStyles.helpCircle} />
    </View>
  );
}

function LogoutIcon() {
  return (
    <View style={iconStyles.base}>
      <View style={iconStyles.logoutArrow} />
    </View>
  );
}

// Icon mapping used to resolve the icon string from the menu item
const iconMap: Record<string, React.ReactNode> = {
  clock: <ClockIcon />,
  language: <LanguageIcon />,
  bank: <BankIcon />,
  schedule: <ScheduleIcon />,
  profile: <ProfileMenuIcon />,
  shield: <ShieldIcon />,
  info: <InfoIcon />,
  help: <HelpIcon />,
  logout: <LogoutIcon />,
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function Sidebar({
  visible,
  onClose,
  onNavigate,
  onSwitchTab,
}: Props) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const {
    mounted,
    translateX,
    backdropOpacity,
    menuItems,
    initials,
    user,
    userIdDisplay,
  } = useSidebar({ visible, onClose, onNavigate, onSwitchTab });

  if (!mounted) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.container]}
      pointerEvents="box-none"
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback
        onPress={onClose}
        accessibilityLabel="Close sidebar"
      >
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: theme.colors.background,
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 8, backgroundColor: theme.colors.primary },
          ]}
        >
          <View style={styles.avatarCircle}>
            <Text variant="body" weight="semiBold" color={theme.colors.primary}>
              {initials}
            </Text>
          </View>
          <Text
            variant="subtitle"
            weight="bold"
            color="#FFFFFF"
            style={styles.userName}
          >
            {user?.name ?? "John Smith"}
          </Text>
          <Text variant="caption" color="rgba(255,255,255,0.85)">
            {userIdDisplay}
          </Text>
        </View>

        {/* Menu */}
        <ScrollView
          style={styles.menuScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.menuContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          {menuItems.map((item, idx) => (
            <View
              key={item.key}
              style={[
                styles.row,
                {
                  borderBottomColor: theme.colors.gray200,
                  borderBottomWidth: idx < menuItems.length - 1 ? 1 : 0,
                },
              ]}
            >
              <IconBox>{iconMap[item.icon as string]}</IconBox>

              <Text
                variant="body"
                weight="semiBold"
                color={theme.colors.text}
                style={styles.rowLabel}
              >
                {item.label}
              </Text>

              {item.type === "toggle" ? (
                <View style={styles.toggleWrapper}>
                  <ToggleSwitch
                    value={item.value}
                    onValueChange={item.onToggle ?? (() => undefined)}
                    disabled={!item.onToggle}
                  />
                  {item.subLabel ? (
                    <Text variant="caption" color={theme.colors.mutedText}>
                      {item.subLabel}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Pressable
                  onPress={item.onPress}
                  style={StyleSheet.absoluteFill}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                />
              )}

              {item.type === "nav" && (
                <ChevronRight color={theme.colors.text} />
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
