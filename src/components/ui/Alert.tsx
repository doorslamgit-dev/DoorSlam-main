// src/components/ui/Alert.tsx
// shadcn-based Alert with DoorSlam API compatibility.

import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";

// ============================================================================
// CVA VARIANTS
// ============================================================================

const alertVariants = cva(
  "relative w-full rounded-xl border p-4",
  {
    variants: {
      variant: {
        error: "bg-destructive/10 border-destructive/30 text-destructive",
        success: "bg-success/10 border-success/30 text-success",
        warning: "bg-warning/10 border-warning/30 text-warning",
        info: "bg-info/10 border-info/30 text-info",
        // shadcn standard aliases
        default: "bg-background text-foreground border-border",
        destructive: "bg-destructive/10 border-destructive/30 text-destructive",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

// ============================================================================
// TYPES
// ============================================================================

export type AlertVariant = "error" | "success" | "warning" | "info";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  title?: string;
  icon?: IconKey;
  hideIcon?: boolean;
  onClose?: () => void;
  action?: ReactNode;
  children: ReactNode;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const variantIcons: Record<AlertVariant, IconKey> = {
  error: "triangle-alert",
  success: "check-circle",
  warning: "triangle-alert",
  info: "info",
};

const variantRoles: Record<AlertVariant, "alert" | "status"> = {
  error: "alert",
  success: "status",
  warning: "alert",
  info: "status",
};

// ============================================================================
// SHADCN COMPOSITIONAL API
// ============================================================================

const AlertRoot = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  )
);
AlertRoot.displayName = "AlertRoot";

const AlertTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-semibold text-sm leading-none tracking-tight", className)} {...props} />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  )
);
AlertDescription.displayName = "AlertDescription";

// ============================================================================
// DOORSLAM COMPAT COMPONENT
// ============================================================================

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = "info",
      title,
      icon,
      hideIcon = false,
      onClose,
      action,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const iconName = icon ?? variantIcons[variant];

    return (
      <div
        ref={ref}
        role={variantRoles[variant]}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className="flex gap-3">
          {!hideIcon && (
            <div className="flex-shrink-0 pt-0.5">
              <AppIcon name={iconName} className="w-5 h-5" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold text-sm">{title}</h4>
            )}
            <div className={cn("text-sm", title && "mt-1")}>
              {children}
            </div>
          </div>

          <div className="flex-shrink-0 flex items-start gap-2">
            {action}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
              >
                <AppIcon name="x" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

export default Alert;
export { Alert, AlertRoot, AlertTitle, AlertDescription, alertVariants };
