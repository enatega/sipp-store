import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthSessionResponse, ProfileEntry } from '../api/authTypes';
import { authSession, AuthSession } from './authSession';
import { sessionExpiryBus } from './sessionExpiryBus';

type AuthContextValue = {
  session: AuthSession;
  isAuthenticated: boolean;
  isReady: boolean;
  setSessionFromResponse: (payload: AuthSessionResponse) => Promise<void>;
  clearSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const emptySession: AuthSession = {
  token: null,
  refreshToken: null,
  user: null,
  profiles: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>(emptySession);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    authSession
      .getSession()
      .then((value) => {
        setSession(value);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = sessionExpiryBus.subscribe(() => {
      setSession(emptySession);
    });
    return unsubscribe;
  }, []);

  const setSessionFromResponse = async (payload: AuthSessionResponse) => {
    await authSession.setSession(payload);
    setSession({
      token: payload.accessToken,
      refreshToken: payload.refreshToken ?? null,
      user: payload.user,
      profiles: payload.profiles ?? null,
    });
  };

  const clearSession = async () => {
    await authSession.clearSession();
    setSession(emptySession);
  };

  const isAuthenticated = Boolean(session.token);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated,
      isReady,
      setSessionFromResponse,
      clearSession,
    }),
    [session, isAuthenticated, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
