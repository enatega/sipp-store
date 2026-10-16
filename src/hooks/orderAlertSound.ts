import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { STORE_ORDER_BEEP_5S_CHANNEL_ID } from '../api/orderNotificationChannels';

let generation = 0;
let current: Audio.Sound | null = null;
let finishCurrent: (() => void) | null = null;

export async function playOrderAlertChime(): Promise<void> {
  const request = ++generation;
  const previous = current;
  const finishPrevious = finishCurrent;
  if (previous) {
    try {
      await previous.stopAsync();
    } catch {
      // The previous sound may already have finished.
    }
    finishPrevious?.();
  }
  try {
    if (request !== generation || AppState.currentState !== 'active') return;
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted || permission.ios?.allowsSound === false) return;
    if (Platform.OS === 'android') {
      const channel = await Notifications.getNotificationChannelAsync(STORE_ORDER_BEEP_5S_CHANNEL_ID);
      if (!channel || channel.importance < Notifications.AndroidImportance.DEFAULT || !channel.sound) return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    });
    if (request !== generation || AppState.currentState !== 'active') return;
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sound/new_order_beep_5s.wav'),
      { shouldPlay: false, isLooping: false, volume: 1 },
    );
    if (request !== generation || AppState.currentState !== 'active') {
      await sound.unloadAsync();
      return;
    }
    current = sound;
    await new Promise<void>((resolve) => {
      let finished = false;
      let timeout: ReturnType<typeof setTimeout> | null = null;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (timeout) clearTimeout(timeout);
        if (current === sound) current = null;
        if (finishCurrent === finish) finishCurrent = null;
        sound.setOnPlaybackStatusUpdate(null);
        void sound.unloadAsync().catch(() => undefined);
        resolve();
      };
      finishCurrent = finish;
      timeout = setTimeout(finish, 5500);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) finish();
        if (!status.isLoaded && status.error) finish();
      });
      void sound.playAsync().catch((error) => {
        console.warn('[store][order-alert] Unable to play beep', error);
        finish();
      });
    });
  } catch (error) {
    console.warn('[store][order-alert] Unable to play beep', error);
  }
}

export async function stopOrderAlertChime(): Promise<void> {
  generation += 1;
  const sound = current;
  const finish = finishCurrent;
  if (!sound) return;
  try {
    await sound.stopAsync();
  } catch {
    // The audio resource may already have finished.
  }
  finish?.();
}
