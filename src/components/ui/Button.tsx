// src/components/ui/Button.tsx
// shadcn-based Button with DoorSlam API compatibility.

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import AppIcon from "./AppIcon";
import type { IconKey } from "./AppIcon";

// ============================================================================
// CVA VARIANTS
// ============================================================================

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // shadcn standard aliases
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "py-2 px-3 text-sm gap-1.5 rounded-lg",
        md: "py-2.5 px-4 text-sm gap-2 rounded-xl",
        lg: "py-3 px-6 text-base gap-2 rounded-xl",
        // shadcn standard aliases
        default: "py-2.5 px-4 text-sm gap-2 rounded-xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// ============================================================================
// TYPES
// ============================================================================

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child component (Radix Slot pattern) */
  asChild?: boolean;
  /** Shows loading spinner and disables button */
  loading?: boolean;
  /** Icon to show on the left */
  leftIcon?: IconKey;
  /** Icon to show on the right */
  rightIcon?: IconKey;
  /** Makes button full width */
  fullWidth?: boolean;
  /** Button content */
  children?: ReactNode;
}

// ============================================================================
// ICON SIZES
// ============================================================================

const iconSizeMap: Record<string, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
  default: "w-4 h-4",
  icon: "w-4 h-4",
};

// ============================================================================
// COMPONENT
// ============================================================================

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const Comp = asChild ? Slot : "button";
    const iconSize = iconSizeMap[size ?? "md"];

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner replaces left icon */}
        {loading ? (
          <span className={cn(iconSize, "animate-spin")}>
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        ) : leftIcon ? (
          <AppIcon name={leftIcon} className={iconSize} />
        ) : null}

        {children}

        {/* Right icon (not shown when loading) */}
        {!loading && rightIcon && (
          <AppIcon name={rightIcon} className={iconSize} />
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export default Button;
export { Button, buttonVariants };
