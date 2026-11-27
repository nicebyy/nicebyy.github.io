"use client";

import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "cyber" | "dark";

export const THEME_STORAGE_KEY = "kimgatta_theme_mode";
export const THEME_CHANGE_EVENT = "kimgatta-theme-change";

/** Reads persisted theme preference safely on client; defaults to Cyberpunk mode. */
export function readStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "cyber";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "cyber") {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return "cyber";
}

/** Applies DOM root classes and attributes so CSS and components stay synced. */
export function applyThemeToDom(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("theme-standard");
    root.setAttribute("data-theme", "standard");
  } else {
    root.classList.remove("theme-standard");
    root.setAttribute("data-theme", "cyber");
  }
}

/** Persists theme mode, updates DOM immediately, and broadcasts change event. */
export function setGlobalThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
  applyThemeToDom(mode);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ThemeMode>(THEME_CHANGE_EVENT, { detail: mode })
    );
  }
}

/** Subscribes a client component to global Cyber/Standard Dark theme state. */
export function useThemeMode() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("cyber");

  useEffect(() => {
    const initial = readStoredThemeMode();
    setThemeModeState(initial);
    applyThemeToDom(initial);

    const handleThemeEvent = (e: Event) => {
      const custom = e as CustomEvent<ThemeMode>;
      if (custom.detail === "dark" || custom.detail === "cyber") {
        setThemeModeState(custom.detail);
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) {
        const next = e.newValue === "dark" ? "dark" : "cyber";
        setThemeModeState(next);
        applyThemeToDom(next);
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    setGlobalThemeMode(mode);
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeModeState((prev) => {
      const next: ThemeMode = prev === "cyber" ? "dark" : "cyber";
      setGlobalThemeMode(next);
      return next;
    });
  }, []);

  return { themeMode, setThemeMode, toggleThemeMode };
}
