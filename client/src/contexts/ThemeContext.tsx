import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
  switchable?: boolean;
}

function getSystemTheme(): ResolvedTheme {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(defaultTheme: ThemePreference): ThemePreference {
  if (typeof window === "undefined") return defaultTheme;
  const stored = window.localStorage.getItem("theme");
  return stored === "light" || stored === "dark" || stored === "system" ? stored : defaultTheme;
}

export function ThemeProvider({ children, defaultTheme = "light", switchable = false }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(() => switchable ? getStoredTheme(defaultTheme) : defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());
  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? "dark" : "light");
    setSystemTheme(media.matches ? "dark" : "light");
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    if (switchable) window.localStorage.setItem("theme", theme);
  }, [resolvedTheme, switchable, theme]);

  const setTheme = (nextTheme: ThemePreference) => {
    if (switchable) setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    if (!switchable) return;
    setThemeState(previous => previous === "light" ? "dark" : previous === "dark" ? "system" : "light");
  };

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme, toggleTheme, switchable }), [theme, resolvedTheme, switchable]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export type { ResolvedTheme, ThemePreference };
