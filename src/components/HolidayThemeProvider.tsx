"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type HolidayTheme = 'default' | 'christmas' | 'halloween' | 'thanksgiving';

interface HolidayThemeContextType {
  theme: HolidayTheme;
  setTheme: (theme: HolidayTheme) => void;
}

const HolidayThemeContext = createContext<HolidayThemeContextType | undefined>(undefined);

export function HolidayThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<HolidayTheme>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("holiday-theme") as HolidayTheme;
    if (saved && ['christmas', 'halloween', 'thanksgiving'].includes(saved)) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    // Remove all theme classes
    root.classList.remove("christmas", "halloween", "thanksgiving");

    if (theme !== 'default') {
      root.classList.add(theme);
    }
    localStorage.setItem("holiday-theme", theme);
  }, [theme, mounted]);

  return (
    <HolidayThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </HolidayThemeContext.Provider>
  );
}

export const useHolidayTheme = () => {
  const context = useContext(HolidayThemeContext);
  if (context === undefined) {
    throw new Error("useHolidayTheme must be used within a HolidayThemeProvider");
  }
  return context;
};
