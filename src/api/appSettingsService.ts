import apiClient from './apiClient';
import { AppSettings } from './appSettingsTypes';

const BASE_PATH = '/apps/deliveries/app-settings/STORE';

export const appSettingsService = {
  getAppSettings: () => apiClient.get<AppSettings>(BASE_PATH, undefined, { skipAuth: true }),
};
