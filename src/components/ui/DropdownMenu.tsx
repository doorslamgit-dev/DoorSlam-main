// src/components/ui/DropdownMenu.tsx
/**
 * DropdownMenu Component
 * ======================
 * Click-triggered dropdown menu with positioned items.
 *
 * FEATURES:
 * - Click outside to close
 * - Escape key to close
 * - Separator support
 * - Danger variant for destructive items
 * - Customisable alignment (left/right) and direction (up/down)
 * - Design tokens for all colours
 * - Dark mode support
 *
 * USAGE:
 * ```tsx
 * <DropdownMenu
 *   trigger={<Button variant="ghost">Menu</Button>}
 *   items={[
 *     { label: 'My Account', icon: 'user', onClick: () => navigate('/account') },
 *     { label: 'Settings', icon: 'settings', onClick: () => navigate('/settings') },
 *     { type: 'separator' },
 *     { label: 'Log out', icon: 'log-out', onClick: handleSignOut, variant: 'danger' },
 *   ]}
 * />
 * ```
 */

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";

// ============================================================================
// TYPES
// ============================================================================

interface DropdownMenuItemAction {
  type?: "item";
  label: string;
  icon?: IconKey;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface DropdownMenuSeparator {
  type: "separator";
}

export type DropdownMenuItem = DropdownMenuItemAction | DropdownMenuSeparator;

export interface DropdownMenuProps {
  /** Trigger element that opens the menu */
  trigger: ReactNode;
  /** Menu items */
  items: DropdownMenuItem[];
  /** Horizontal alignment */
  align?: "left" | "right";
  /** Open direction */
  direction?: "up" | "down";
  /** Additional className for the menu container */
  className?: string;
  /** Width of the menu */
  width?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DropdownMenu({
  trigger,
  items,
  align = "left",
  direction = "up",
  className = "",
  width = "w-48",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, close]);

  const positionClasses = [
    direction === "up" ? "bottom-full mb-2" : "top-full mt-2",
    align === "right" ? "right-0" : "left-0",
  ].join(" ");

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div onClick={() => setOpen(!open)}>{trigger}</div>

      {/* Menu */}
      {open && (
        <div
          className={[
            "absolute z-[var(--z-dropdown)]",
            positionClasses,
            width,
            "bg-neutral-0 rounded-xl shadow-card border border-neutral-200/60 py-1",
            "transition-all duration-150",
          ].join(" ")}
        >
          {items.map((item, idx) => {
            if (item.type === "separator") {
              return (
                <div
                  key={`sep-${idx}`}
                  className="border-t border-neutral-200/60 my-1"
                />
              );
            }

            const isDanger = item.variant === "danger";

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  close();
                  item.onClick();
                }}
                className={[
                  "w-full px-4 py-2.5 text-left text-sm flex items-center gap-3",
                  "transition-colors",
                  isDanger
                    ? "text-danger hover:bg-error-bg"
                    : "text-neutral-700 hover:bg-neutral-50",
                ].join(" ")}
              >
                {item.icon && (
                  <AppIcon
                    name={item.icon}
                    className={`w-4 h-4 ${isDanger ? "" : "text-neutral-400"}`}
                  />
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
