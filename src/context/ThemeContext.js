import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getColors } from "../theme";

const ThemeContext = createContext(null);
const STORAGE_KEY = "smartspend_theme";

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") setThemeState(v);
    });
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const resolvedScheme = theme === "system" ? (systemScheme === "dark" ? "dark" : "light") : theme;
  const colors = useMemo(() => getColors(resolvedScheme), [resolvedScheme]);

  const value = { theme, setTheme, resolvedScheme, colors };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
