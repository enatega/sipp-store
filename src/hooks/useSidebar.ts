import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, Animated, Linking } from "react-native";
import { useAuth } from "../auth/AuthProvider";
import { useLogoutMutation } from "../hooks/useAuthMutations";
import { useAvailabilityQuery } from "../hooks/useProfileQueries";
import { useUpdateAvailability } from "../hooks/useProfileMutations";

const DRAWER_WIDTH = 300;
const ANIMATION_DURATION = 280;


type MenuItemBase = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

type MenuItemNav = MenuItemBase & { type: "nav"; onPress: () => void };
type MenuItemToggle = MenuItemBase & {
  type: "toggle";
  value: boolean;
  onToggle?: (v: boolean) => void;
  subLabel?: string;
};
export type MenuItem = MenuItemNav | MenuItemToggle;

interface UseSidebarOptions {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: "Language" | "BankManagement" | "WorkSchedule") => void;
  onSwitchTab?: (tab: "Profile") => void;
}

export function useSidebar({
  visible,
  onClose,
  onNavigate,
  onSwitchTab,
}: UseSidebarOptions) {
  const { session } = useAuth();
  const logoutMutation = useLogoutMutation();
  const { data: availabilityData, isLoading: availabilityLoading } =
    useAvailabilityQuery();
  const updateAvailability = useUpdateAvailability();

  const [mounted, setMounted] = useState(visible);

  const currentAvailability = availabilityData?.store_available ?? true;

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const animateOpen = useCallback(() => {
    translateX.setValue(-DRAWER_WIDTH);
    backdropOpacity.setValue(0);
    setMounted(true);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, backdropOpacity]);

  const animateClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => setMounted(false));
  }, [translateX, backdropOpacity]);

  useEffect(() => {
    if (visible) animateOpen();
    else animateClose();
  }, [visible, animateOpen, animateClose]);

  const handleAvailabilityToggle = (newValue: boolean) => {
    updateAvailability.mutate({ storeAvailable: newValue });
  };

  const openExternalUrl = useCallback(
    async (url: string) => {
      onClose();
      try {
        const supported = await Linking.canOpenURL(url);
        if (!supported) {
          Alert.alert("Unable to open link", url);
          return;
        }
        await Linking.openURL(url);
      } catch {
        Alert.alert("Unable to open link", url);
      }
    },
    [onClose],
  );

  const user = session.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "JS";

  const userIdDisplay = user?.id
    ? user.id.length > 10
      ? user.id.substring(0, 10) + "..."
      : user.id
    : "";

  const menuItems: MenuItem[] = [
    {
      key: "availability",
      type: "toggle",
      label: "Availability",
      icon: "clock", // placeholder – actual icon elements still passed from UI
      value: currentAvailability,
      onToggle:
        availabilityLoading || updateAvailability.isPending
          ? undefined
          : handleAvailabilityToggle,
      subLabel: availabilityLoading
        ? "Loading..."
        : updateAvailability.isPending
          ? "Updating..."
          : currentAvailability
            ? "Available"
            : "Unavailable",
    },
    {
      key: "language",
      type: "nav",
      label: "Language",
      icon: "language",
      onPress: () => {
        onClose();
        onNavigate("Language");
      },
    },
    {
      key: "bank",
      type: "nav",
      label: "Bank Management",
      icon: "bank",
      onPress: () => {
        onClose();
        onNavigate("BankManagement");
      },
    },
    {
      key: "schedule",
      type: "nav",
      label: "Work schedule",
      icon: "schedule",
      onPress: () => {
        onClose();
        onNavigate("WorkSchedule");
      },
    },
    {
      key: "profile",
      type: "nav",
      label: "Profile",
      icon: "profile",
      onPress: () => {
        onClose();
        onSwitchTab?.("Profile");
      },
    },
    {
      key: "privacy",
      type: "nav",
      label: "Privacy Policy",
      icon: "shield",
      onPress: () => openExternalUrl("https://multivendor.enatega.com/terms"),
    },
    {
      key: "about",
      type: "nav",
      label: "About Us",
      icon: "info",
      onPress: () => openExternalUrl("https://multivendor.enatega.com/about"),
    },
    {
      key: "help",
      type: "nav",
      label: "Help",
      icon: "help",
      onPress: () => openExternalUrl("https://ninjascode.com/"),
    },
    {
      key: "logout",
      type: "nav",
      label: "Logout",
      icon: "logout",
      onPress: () => logoutMutation.mutate(),
    },
  ];

  return {
    mounted,
    translateX,
    backdropOpacity,
    menuItems,
    user,
    initials,
    userIdDisplay,
    onClose,
  };
}
