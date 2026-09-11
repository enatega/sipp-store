import apiClient from './apiClient';
import { AuthSessionResponse, AuthUser, LoginPayload } from './authTypes';

// Base URL already includes /api/v1 — paths here are relative to that
const AUTH_STORE = '/auth/login/store/email';
const AUTH_ME = '/auth/me';

export const authService = {
  /**
   * POST /api/v1/auth/login/store/email
   * Body: { email, password, device_push_token? }
   */
  login: (payload: LoginPayload) =>
    apiClient.post<AuthSessionResponse>(AUTH_STORE, payload, { skipAuth: true }),

  me: () => apiClient.get<AuthUser>(AUTH_ME),

  // Useful for local app wiring before backend auth endpoints are ready.
  createDemoSession: async (appTag: 'store' | 'rider'): Promise<AuthSessionResponse> => ({
    accessToken: appTag + '-demo-token',
    refreshToken: null,
    user: {
      id: appTag + '-demo-user',
      name: appTag === 'store' ? 'Store Demo User' : 'Rider Demo User',
      email: appTag + '@demo.enatega.app',
    },
  }),
};
