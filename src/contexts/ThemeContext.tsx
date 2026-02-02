// src/contexts/ThemeContext.tsx

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  // Initialize theme from localStorage or default to light mode
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;

    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // Default to light mode on first visit
    // (System preference check removed - always start in light mode)
    return defaultTheme;
  });

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Persist to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // System preference listener disabled - we default to light mode
  // Users can manually toggle to dark mode using the theme toggle button
  // useEffect(() => {
  //   const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  //   const handleChange = (e: MediaQueryListEvent) => {
  //     const storedTheme = localStorage.getItem('theme');
  //     if (!storedTheme) {
  //       setThemeState(e.matches ? 'dark' : 'light');
  //     }
  //   };
  //   mediaQuery.addEventListener('change', handleChange);
  //   return () => mediaQuery.removeEventListener('change', handleChange);
  // }, []);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @example
 * const { theme, toggleTheme, setTheme } = useTheme();
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
