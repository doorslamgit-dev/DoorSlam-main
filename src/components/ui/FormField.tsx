// src/components/ui/FormField.tsx
// shadcn-based FormField with DoorSlam API compatibility.
// Uses shadcn Input, Textarea, and Label under the hood.

import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface BaseFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    BaseFieldProps {}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseFieldProps {}

// ============================================================================
// SHARED STYLES
// ============================================================================

const baseInputStyles =
  "flex w-full px-4 py-3 text-foreground placeholder:text-muted-foreground border border-input rounded-xl bg-background transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed";

const errorInputStyles =
  "border-destructive focus-visible:ring-destructive";

const labelStyles =
  "block text-sm font-medium mb-2 text-foreground";

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

function Label({ htmlFor, required, children, className }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn(labelStyles, className)}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

interface FieldMessageProps {
  error?: string;
  helperText?: string;
}

function FieldMessage({ error, helperText }: FieldMessageProps) {
  if (!error && !helperText) return null;
  return (
    <p className={cn("mt-1.5 text-sm", error ? "text-destructive" : "text-muted-foreground")}>
      {error || helperText}
    </p>
  );
}

// ============================================================================
// INPUT COMPONENT
// ============================================================================

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      wrapperClassName,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className={wrapperClassName}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cn(baseInputStyles, error && errorInputStyles, className)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        <FieldMessage error={error} helperText={helperText} />
      </div>
    );
  }
);

Input.displayName = "FormField";

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      wrapperClassName,
      className,
      id,
      required,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name;

    return (
      <div className={wrapperClassName}>
        {label && (
          <Label htmlFor={textareaId} required={required}>
            {label}
          </Label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          className={cn(baseInputStyles, "resize-none", error && errorInputStyles, className)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        <FieldMessage error={error} helperText={helperText} />
      </div>
    );
  }
);

Textarea.displayName = "FormField.Textarea";

// ============================================================================
// EXPORTS
// ============================================================================

const FormField = Input as typeof Input & {
  Textarea: typeof Textarea;
  Label: typeof Label;
};

FormField.Textarea = Textarea;
FormField.Label = Label;

export default FormField;
