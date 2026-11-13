"use client";

import { useState, useEffect, useCallback } from "react";
import {
  OperatorSession,
  getOperatorSession,
  authenticateOperator,
  clearOperatorSession,
  AUTH_EVENT_NAME,
} from "./auth";
import { DEFAULT_BRANCH } from "./github-api";

export function useOperatorAuth() {
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with storage and custom events
  const syncSession = useCallback(() => {
    const active = getOperatorSession();
    setSession(active);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    syncSession();

    const handleAuthEvent = (e: Event) => {
      const custom = e as CustomEvent<OperatorSession | null>;
      setSession(custom.detail ?? null);
      setIsLoading(false);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cyber_operator_session") {
        syncSession();
      }
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncSession]);

  const login = async (token: string, branch: string = DEFAULT_BRANCH) => {
    setIsLoading(true);
    const res = await authenticateOperator(token, branch);
    setIsLoading(false);
    if (res.success && res.session) {
      setSession(res.session);
    }
    return res;
  };

  const logout = () => {
    clearOperatorSession();
    setSession(null);
  };

  return {
    isAuthenticated: Boolean(session && session.token),
    session,
    isLoading,
    login,
    logout,
  };
}
