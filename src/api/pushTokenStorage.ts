import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sipp_store_device_push_token';

export const pushTokenStorage = {
  save: (token: string | null | undefined) => token ? AsyncStorage.setItem(KEY, token) : AsyncStorage.removeItem(KEY),
  get: () => AsyncStorage.getItem(KEY),
  clear: () => AsyncStorage.removeItem(KEY),
};
