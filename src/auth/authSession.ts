import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenManager } from '../api/apiClient';
import type { AuthSessionResponse, AuthUser, ProfileEntry } from '../api/authTypes';

const USER_KEY = 'deliveries_store_app_auth_user';
const PROFILES_KEY = 'deliveries_store_app_auth_profiles';

export type AuthSession = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  profiles: ProfileEntry[] | null;
};

const getUser = async (): Promise<AuthUser | null> => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};

const getProfiles = async (): Promise<ProfileEntry[] | null> => {
  const raw = await AsyncStorage.getItem(PROFILES_KEY);
  return raw ? (JSON.parse(raw) as ProfileEntry[]) : null;
};

export const authSession = {
  setSession: async (payload: AuthSessionResponse) => {
    await tokenManager.setToken(payload.accessToken);

    if (payload.refreshToken) {
      await tokenManager.setRefreshToken(payload.refreshToken);
    } else {
      await tokenManager.removeRefreshToken();
    }

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(payload.user));

    if (payload.profiles) {
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(payload.profiles));
    } else {
      await AsyncStorage.removeItem(PROFILES_KEY);
    }

    return payload;
  },

  getSession: async (): Promise<AuthSession> => {
    const [token, refreshToken, user, profiles] = await Promise.all([
      tokenManager.getToken(),
      tokenManager.getRefreshToken(),
      getUser(),
      getProfiles(),
    ]);

    return { token, refreshToken, user, profiles };
  },

  clearSession: async () => {
    await tokenManager.clearAll();
    await AsyncStorage.multiRemove([USER_KEY, PROFILES_KEY]);
  },
};
