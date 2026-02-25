// src/components/ui/ThemeToggle.tsx
// Updated to use cn() and shadcn color tokens.

import { useTheme } from "../../contexts/ThemeContext";
import { cn } from "@/lib/utils";
import AppIcon from "./AppIcon";

interface ThemeToggleProps {
  variant?: "icon" | "button" | "switch";
  className?: string;
}

export default function ThemeToggle({ variant = "switch", className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        className={cn("p-2 rounded-lg hover:bg-accent transition-colors", className)}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? (
          <AppIcon name="sun" className="w-5 h-5 text-warning" />
        ) : (
          <AppIcon name="moon" className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all",
          className
        )}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          {isDark ? (
            <AppIcon name="moon" className="w-5 h-5 text-primary" />
          ) : (
            <AppIcon name="sun" className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-foreground">
            {isDark ? "Dark Mode" : "Light Mode"}
          </div>
          <div className="text-sm text-muted-foreground">
            {isDark ? "Switch to light theme" : "Switch to dark theme"}
          </div>
        </div>
        <AppIcon name="arrow-right" className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  }

  // Switch variant (default)
  return (
    <button
      onClick={toggleTheme}
      className={cn("relative inline-flex items-center gap-3", className)}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative w-14 h-8 bg-secondary rounded-full transition-colors">
        <div
          className={cn(
            "absolute top-1 left-1 w-6 h-6 bg-background rounded-full shadow-md transition-transform duration-200 flex items-center justify-center",
            isDark ? "translate-x-6" : "translate-x-0"
          )}
        >
          {isDark ? (
            <AppIcon name="moon" className="w-3 h-3 text-foreground" />
          ) : (
            <AppIcon name="sun" className="w-3 h-3 text-primary" />
          )}
        </div>
      </div>
      <span className="text-sm font-medium text-foreground">
        {isDark ? "Dark" : "Light"} Mode
      </span>
    </button>
  );
}
