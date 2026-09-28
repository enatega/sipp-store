import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

let cachedToken: string | null = null;
let inFlightTokenPromise: Promise<string | null> | null = null;

function getEasProjectId(): string | undefined {
  const expoConfigProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  const easConfigProjectId = Constants.easConfig?.projectId;
  const envProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  return easConfigProjectId ?? expoConfigProjectId ?? envProjectId;
}

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    sound: "beep3.mp3",
  });
}

async function getPushTokenInternal(): Promise<string | null> {
  try {
    const projectId = getEasProjectId();
    console.log("[PushToken] start", {
      platform: Platform.OS,
      projectId: projectId ?? null,
    });

    await ensureAndroidNotificationChannel();

    const permissions = await Notifications.getPermissionsAsync();
    let status = permissions.status;
    console.log("[PushToken] existing permission status", status);

    if (status !== "granted" && permissions.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
      console.log("[PushToken] requested permission status", status);
    }

    if (status !== "granted" && (await Notifications.getPermissionsAsync()).ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
      console.log("[PushToken] permission denied, returning null token");
      return null;
    }

    const response = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    console.log("[PushToken] token fetch response", {
      hasToken: Boolean(response.data),
    });
    if (response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.log("[PushToken] failed to fetch token", error);
    return null;
  }
}

export async function getExpoPushTokenForAuth(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  if (inFlightTokenPromise) {
    return inFlightTokenPromise;
  }

  inFlightTokenPromise = getPushTokenInternal();

  try {
    const token = await inFlightTokenPromise;
    if (token) {
      cachedToken = token;
    }
    return token;
  } finally {
    inFlightTokenPromise = null;
  }
}
