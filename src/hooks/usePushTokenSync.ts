import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../auth/AuthProvider';
import apiClient from '../api/apiClient';
import { pushTokenStorage } from '../api/pushTokenStorage';
import { ensureStoreNotificationChannels, STORE_ORDER_BEEP_5S_CHANNEL_ID } from '../api/orderNotificationChannels';

export function usePushTokenSync() {
  const { session } = useAuth();
  const lastRegistered = useRef<string | null>(null);
  const lastRegisteredAt = useRef(0);

  useEffect(() => {
    lastRegistered.current = null;
    lastRegisteredAt.current = 0;
    if (!session.token || !Device.isDevice) return;
    let disposed = false;
    const sync = async () => {
      try {
        const hasOrderBeepChannel = await ensureStoreNotificationChannels();
        const permission = await Notifications.getPermissionsAsync();
        if (!permission.granted && permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) return;
        const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) return;
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        if (disposed || !token || (token === lastRegistered.current && Date.now() - lastRegisteredAt.current < 24 * 60 * 60 * 1000)) return;
        let soundCapabilityConfirmed = false;
        const registered = await pushTokenStorage.register(
          token,
          async () => {
            const result = await apiClient.post<{ registered: boolean; soundCapability?: string }>(
              '/users/push-token/register',
              { token, orderAlertSoundV1: true, storeOrderAlertSoundV2: true, storeOrderAlertSoundV3: true, storeOrderAlertSoundV4: hasOrderBeepChannel },
            );
            console.info('[store][push] token registration', {
              registered: result.registered,
              requestedChannel: hasOrderBeepChannel ? STORE_ORDER_BEEP_5S_CHANNEL_ID : 'legacy',
              serverCapability: result.soundCapability ?? 'unknown',
            });
            soundCapabilityConfirmed = result.soundCapability === 'store-v4';
          },
        );
        if (registered && (!hasOrderBeepChannel || soundCapabilityConfirmed)) {
          lastRegistered.current = token;
          lastRegisteredAt.current = Date.now();
        } else if (registered && hasOrderBeepChannel) {
          console.warn('[store][push] server did not confirm the store sound channel; registration will retry on next app resume');
        }
      } catch (error) {
        console.warn('[store][push] token registration failed', error instanceof Error ? error.message : String(error));
      }
    };
    void sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void sync();
    });
    return () => { disposed = true; subscription.remove(); };
  }, [session.token]);
}
