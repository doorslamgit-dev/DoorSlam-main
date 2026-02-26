// src/components/ui/Toast.tsx
/**
 * Toast / Notification Component
 * ==============================
 * Fixed-position toast notifications with auto-dismiss.
 *
 * FEATURES:
 * - 4 variants: success, error, warning, info
 * - Auto-dismiss with configurable duration
 * - Stacks vertically (top-right)
 * - Slide-in animation
 * - Manual dismiss with close button
 * - Design tokens for all colours
 * - Dark mode support
 *
 * USAGE:
 * ```tsx
 * // In providers.tsx:
 * <ToastProvider>{children}</ToastProvider>
 *
 * // In any component:
 * const { toast, dismiss } = useToast();
 * toast({ variant: 'success', title: 'Saved!' });
 * ```
 */

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";

// ============================================================================
// TYPES
// ============================================================================

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

export type ToastInput = Omit<ToastData, "id">;

interface ToastContextType {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-success/10 border-success/20 text-foreground",
  error: "bg-destructive/10 border-destructive/20 text-foreground",
  warning: "bg-warning/10 border-warning/20 text-foreground",
  info: "bg-info/10 border-info/20 text-foreground",
};

const variantIcons: Record<ToastVariant, IconKey> = {
  success: "check-circle",
  error: "alert-circle",
  warning: "alert-triangle",
  info: "info",
};

const variantIconColors: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-destructive",
  warning: "text-warning",
  info: "text-info",
};

const DEFAULT_DURATION = 4000;

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================================================
// TOAST ITEM
// ============================================================================

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in on next frame
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const duration = t.duration ?? DEFAULT_DURATION;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(t.id), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, onDismiss]);

  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md",
        "transition-all duration-200",
        variantStyles[t.variant],
        visible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-4",
      ].join(" ")}
    >
      <AppIcon
        name={variantIcons[t.variant]}
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${variantIconColors[t.variant]}`}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{t.title}</p>
        {t.description && (
          <p className="text-xs mt-0.5 opacity-80">{t.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(t.id), 200);
        }}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <AppIcon name="x" className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// PROVIDER
// ============================================================================

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((input: ToastInput): string => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { ...input, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss }}>
      {children}

      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[var(--z-tooltip)] flex flex-col gap-2 w-80 pointer-events-auto">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
