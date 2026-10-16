import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const STORE_ORDER_CHIME_CHANNEL_ID = 'store-new-orders-chime-v2';
export const STORE_ORDER_BEEP_CHANNEL_ID = 'store-new-orders-beep-v3';
export const STORE_ORDER_BEEP_5S_CHANNEL_ID = 'store-new-orders-beep-5s-v4';

let lastChannelDiagnostic: string | null = null;

export async function ensureStoreNotificationChannels(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  await Notifications.setNotificationChannelAsync('new-orders-chime-v1', {
    name: 'New orders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'new_order_chime.wav',
    vibrationPattern: [0, 250],
  });
  // Android cannot change the sound of a channel that already exists.
  await Notifications.setNotificationChannelAsync(STORE_ORDER_CHIME_CHANNEL_ID, {
    name: 'New store orders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'new_order_chime.wav',
    vibrationPattern: [0, 250],
  });
  await Notifications.setNotificationChannelAsync(STORE_ORDER_BEEP_CHANNEL_ID, {
    name: 'New store orders (beep)',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'new_order_beep.wav',
    vibrationPattern: [0, 250],
  });
  await Notifications.setNotificationChannelAsync(STORE_ORDER_BEEP_5S_CHANNEL_ID, {
    name: 'New store orders (5 second beep)',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'new_order_beep_5s.wav',
    vibrationPattern: [0, 250],
  });
  await Notifications.setNotificationChannelAsync('new-orders-silent-v1', {
    name: 'Additional new orders',
    importance: Notifications.AndroidImportance.LOW,
    vibrationPattern: [0],
  });
  await Notifications.setNotificationChannelAsync('store-general-v1', {
    name: 'Store updates',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
  const channel = await Notifications.getNotificationChannelAsync(STORE_ORDER_BEEP_5S_CHANNEL_ID);
  const diagnostic = JSON.stringify({
    id: STORE_ORDER_BEEP_5S_CHANNEL_ID,
    exists: Boolean(channel),
    importance: channel?.importance ?? null,
    sound: channel?.sound ?? null,
  });
  if (diagnostic !== lastChannelDiagnostic) {
    console.info('[store][push] order channel', diagnostic);
    lastChannelDiagnostic = diagnostic;
  }
  return Boolean(channel);
}
