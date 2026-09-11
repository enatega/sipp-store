import { useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

const DEFAULT_ANDROID_CHANNEL_ID = "default";

const getProjectId = () =>
  Constants.expoConfig?.extra?.eas?.projectId
  ?? Constants.easConfig?.projectId
  ?? process.env.EXPO_PUBLIC_EAS_PROJECT_ID
  ?? null;

const toErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to fetch Expo push token.";
};

export function useExpoPushToken() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getExpoPushToken = async () => {
    if (expoPushToken) {
      return expoPushToken;
    }

    setIsLoading(true);

    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
          DEFAULT_ANDROID_CHANNEL_ID,
          {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#7BAF00",
          },
        );
      }

      if (!Device.isDevice) {
        throw new Error("Expo push token requires a physical device.");
      }

      const permissionResponse = await Notifications.getPermissionsAsync();
      let finalStatus = permissionResponse.status;

      if (finalStatus !== "granted") {
        const requestedPermission = await Notifications.requestPermissionsAsync();
        finalStatus = requestedPermission.status;
      }

      if (finalStatus !== "granted") {
        throw new Error("Notification permission was not granted.");
      }

      const projectId = getProjectId();

      if (!projectId) {
        throw new Error("Expo project ID is missing from app config.");
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;

      console.log("[EXPO PUSH TOKEN][STORE]", token);
      setExpoPushToken(token);
      return token;
    } catch (error) {
      console.log("[EXPO PUSH TOKEN ERROR][STORE]", toErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    expoPushToken,
    getExpoPushToken,
    isLoading,
  };
}
