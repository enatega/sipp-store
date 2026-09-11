import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { apiConfig } from './apiConfig';
import { sessionExpiryBus } from '../auth/sessionExpiryBus';

const TOKEN_KEY = 'deliveries_store_app_auth_token';
const REFRESH_TOKEN_KEY = 'deliveries_store_app_refresh_token';
const USER_KEY = 'deliveries_store_app_auth_user';
const PROFILES_KEY = 'deliveries_store_app_auth_profiles';

type ApiErrorResponseData = {
  message?: string | string[];
  code?: string;
  error?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: unknown;

  constructor(message: string, status: number, code?: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export const tokenManager = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  removeToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  clearAll: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

const httpClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMs,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const ENABLE_API_DEBUG_LOGS = true;
let isSessionExpiryHandling = false;

const getRequestPath = (config: AxiosRequestConfig): string => {
  const base = (config.baseURL ?? '').replace(/\/$/, '');
  const url = String(config.url ?? '');
  const path = url.startsWith('http') ? url : base + (url.startsWith('/') ? url : '/' + url);
  return path;
};

const isSessionExpiredError = (error: AxiosError<ApiErrorResponseData>): boolean => {
  const status = error.response?.status;
  const data = error.response?.data as
    | (ApiErrorResponseData & { shouldLogout?: boolean })
    | undefined;
  const hasTokenExpiredCode = data?.code === 'TOKEN_EXPIRED' || data?.error === 'TOKEN_EXPIRED';
  const hasLogoutFlag = data?.shouldLogout === true;
  return (status === 401 || status === 403) && (hasTokenExpiredCode || hasLogoutFlag);
};

const clearPersistedSession = async () => {
  await tokenManager.clearAll();
  await AsyncStorage.multiRemove([USER_KEY, PROFILES_KEY]);
};

const handleSessionExpired = async () => {
  if (isSessionExpiryHandling) return;
  isSessionExpiryHandling = true;

  await clearPersistedSession();
  sessionExpiryBus.emit();

  Alert.alert(
    'Session Expired',
    'Your session has expired. Please log in again.',
    [
      {
        text: 'OK',
        onPress: () => {
          isSessionExpiryHandling = false;
        },
      },
    ],
    { cancelable: false }
  );
};

if (ENABLE_API_DEBUG_LOGS) {
  httpClient.interceptors.request.use((config) => {
    const startedAt = Date.now();
    (config as AxiosRequestConfig & { metadata?: { startedAt: number } }).metadata = {
      startedAt,
    };
    const method = String(config.method ?? 'GET').toUpperCase();
    const path = getRequestPath(config);
    console.log('[API REQUEST]', method, path, { params: config.params, data: config.data });
    return config;
  });

  httpClient.interceptors.response.use(
    (response) => {
      const configWithMeta = response.config as AxiosRequestConfig & {
        metadata?: { startedAt: number };
      };
      const startedAt = configWithMeta.metadata?.startedAt;
      const durationMs = startedAt ? Date.now() - startedAt : undefined;
      const method = String(response.config.method ?? 'GET').toUpperCase();
      const path = getRequestPath(response.config);
      console.log('[API RESPONSE]', method, path, {
        status: response.status,
        durationMs,
        data: response.data,
      });
      return response;
    },
    (error) => {
      if (axios.isAxiosError(error)) {
        const config = error.config as
          | (AxiosRequestConfig & { metadata?: { startedAt: number } })
          | undefined;
        const startedAt = config?.metadata?.startedAt;
        const durationMs = startedAt ? Date.now() - startedAt : undefined;
        const method = String(config?.method ?? 'GET').toUpperCase();
        const path = config ? getRequestPath(config) : 'unknown';
        console.log('[API ERROR]', method, path, {
          status: error.response?.status ?? 0,
          durationMs,
          message: error.message,
          data: error.response?.data,
        });
      } else {
        console.log('[API ERROR]', 'UNKNOWN', { message: String(error) });
      }
      return Promise.reject(error);
    }
  );
}

httpClient.interceptors.request.use(async (config) => {
  const headers = config.headers as
    | (Record<string, string> & {
        set?: (name: string, value: string) => void;
        delete?: (name: string) => void;
        get?: (name: string) => string | undefined;
      })
    | undefined;

  const hasSkipAuth = headers?.get?.('x-skip-auth') ?? headers?.['x-skip-auth'];
  if (hasSkipAuth) {
    headers?.delete?.('x-skip-auth');
    if (headers) {
      delete headers['x-skip-auth'];
    }
    return config;
  }

  const token = await tokenManager.getToken();
  if (token && headers) {
    if (typeof headers.set === 'function') {
      headers.set('Authorization', 'Bearer ' + token);
    } else {
      headers.Authorization = 'Bearer ' + token;
    }
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && isSessionExpiredError(error)) {
      await handleSessionExpired();
    }
    return Promise.reject(error);
  }
);

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponseData>;
    const status = axiosError.response?.status ?? 0;
    const data = axiosError.response?.data;
    const message = Array.isArray(data?.message)
      ? data.message.filter(Boolean).join('\n')
      : data?.message;

    return new ApiError(
      message ?? data?.error ?? axiosError.message ?? 'Request failed',
      status,
      data?.code,
      data
    );
  }

  return new ApiError('Network error. Please check your internet connection.', 0, 'NETWORK_ERROR');
}

export type ApiRequestOptions = {
  skipAuth?: boolean;
  headers?: Record<string, string>;
};

async function request<T>(
  config: AxiosRequestConfig,
  options: ApiRequestOptions = {}
): Promise<T> {
  try {
    const response = await httpClient.request<T>({
      ...config,
      headers: options.skipAuth
        ? { ...config.headers, ...options.headers, 'x-skip-auth': '1' }
        : { ...config.headers, ...options.headers },
    });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

const apiClient = {
  get: <T>(path: string, params?: Record<string, unknown>, options?: ApiRequestOptions) =>
    request<T>({ method: 'GET', url: path, params }, options),

  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>({ method: 'POST', url: path, data: body }, options),

  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>({ method: 'PATCH', url: path, data: body }, options),

  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>({ method: 'PUT', url: path, data: body }, options),

  delete: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>({ method: 'DELETE', url: path }, options),
};

export default apiClient;
