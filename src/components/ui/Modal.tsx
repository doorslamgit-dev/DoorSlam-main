// src/components/ui/Modal.tsx

import { type ReactNode, useEffect } from "react";
import AppIcon from "./AppIcon";

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

const maxWidthStyles: Record<ModalMaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = "md",
  children,
  footer,
}: ModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative bg-neutral-0 rounded-2xl shadow-xl w-full ${maxWidthStyles[maxWidth]} mx-4 max-h-[90vh] flex flex-col overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-neutral-700">{title}</h2>
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition"
            aria-label="Close"
          >
            <AppIcon name="x" className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
