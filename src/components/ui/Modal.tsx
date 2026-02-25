// src/components/ui/Modal.tsx
// shadcn Dialog-based Modal with DoorSlam API compatibility.

import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type ModalMaxWidth = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: ModalMaxWidth;
  children: ReactNode;
  footer?: ReactNode;
}

// ============================================================================
// MAX WIDTH MAP
// ============================================================================

const maxWidthStyles: Record<ModalMaxWidth, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = "md",
  children,
  footer,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "rounded-xl max-h-[90vh] flex flex-col overflow-hidden p-0",
          maxWidthStyles[maxWidth]
        )}
      >
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
          {subtitle && (
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {subtitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <DialogFooter className="px-6 py-4 border-t border-border bg-muted shrink-0">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
