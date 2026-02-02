// src/components/ui/ThemeToggle.tsx

import { useTheme } from '../../contexts/ThemeContext';
import AppIcon from './AppIcon';

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'switch';
  className?: string;
}

/**
 * Theme toggle component with multiple variants
 * @example
 * // Icon only (minimal)
 * <ThemeToggle variant="icon" />
 *
 * // Full button with label
 * <ThemeToggle variant="button" />
 *
 * // Switch style (default)
 * <ThemeToggle variant="switch" />
 */
export default function ThemeToggle({ variant = 'switch', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Icon-only variant (minimal, for headers/navbars)
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <AppIcon name="sun" className="w-5 h-5 text-amber-400" />
        ) : (
          <AppIcon name="moon" className="w-5 h-5 text-neutral-600" />
        )}
      </button>
    );
  }

  // Full button variant (for settings pages)
  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          {isDark ? (
            <AppIcon name="moon" className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          ) : (
            <AppIcon name="sun" className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-neutral-700 dark:text-neutral-200">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          </div>
        </div>
        <AppIcon name="arrow-right" className="w-4 h-4 text-neutral-400" />
      </button>
    );
  }

  // Switch variant (default, toggle switch style)
  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-3 ${className}`}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-14 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full transition-colors">
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-neutral-200 rounded-full shadow-md transition-transform duration-200 flex items-center justify-center ${
            isDark ? 'translate-x-6' : 'translate-x-0'
          }`}
        >
          {isDark ? (
            <AppIcon name="moon" className="w-3 h-3 text-neutral-700" />
          ) : (
            <AppIcon name="sun" className="w-3 h-3 text-primary-600" />
          )}
        </div>
      </div>
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {isDark ? 'Dark' : 'Light'} Mode
      </span>
    </button>
  );
}
