// src/components/ui/Card.tsx
// shadcn-based Card with DoorSlam API compatibility.

import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================================
// CVA VARIANTS
// ============================================================================

const cardVariants = cva(
  "rounded-xl transition-all duration-150",
  {
    variants: {
      variant: {
        default: "bg-card shadow-sm border border-border",
        elevated: "bg-card shadow-lg border border-border",
        outlined: "bg-card border-2 border-border",
        flat: "bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const interactiveStyles: Record<string, string> = {
  default: "hover:shadow-md hover:border-border cursor-pointer",
  elevated: "hover:shadow-xl cursor-pointer",
  outlined: "hover:border-primary cursor-pointer",
  flat: "hover:bg-muted/80 cursor-pointer",
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

// ============================================================================
// TYPES
// ============================================================================

export type CardVariant = "default" | "elevated" | "outlined" | "flat";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  interactive?: boolean;
  children: ReactNode;
}

// ============================================================================
// SHADCN COMPOSITIONAL API
// ============================================================================

const CardRoot = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
);
CardRoot.displayName = "CardRoot";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

// ============================================================================
// DOORSLAM COMPAT COMPONENT
// ============================================================================

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      title,
      subtitle,
      action,
      interactive = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isInteractive = interactive || !!onClick;
    const hasHeader = title || action;

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant }),
          isInteractive && interactiveStyles[variant],
          !title && paddingStyles[padding],
          className
        )}
        onClick={onClick}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        {...props}
      >
        {hasHeader && (
          <div
            className={cn(
              "flex items-center justify-between",
              paddingStyles[padding],
              children && "pb-0"
            )}
          >
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}

        {children && (
          <div className={hasHeader ? paddingStyles[padding] : ""}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
export { Card, CardRoot, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
