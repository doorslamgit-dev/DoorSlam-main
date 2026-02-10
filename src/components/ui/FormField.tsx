// src/components/ui/FormField.tsx
/**
 * FormField Component
 * ===================
 * Consistent form input styling with label, error state, and helper text.
 *
 * INCLUDES:
 * - Input: Text, email, password, number inputs
 * - Textarea: Multi-line text input
 * - Label: Styled label with optional indicator
 *
 * FEATURES:
 * - Consistent focus states (ring-2 ring-primary-500)
 * - Error state styling (red border + message)
 * - Helper text support
 * - Required indicator
 * - Disabled state
 * - Dark mode support
 *
 * USAGE:
 * ```tsx
 * // Simple input
 * <FormField
 *   label="Email address"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   placeholder="you@example.com"
 * />
 *
 * // With error
 * <FormField
 *   label="Password"
 *   type="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   error="Password must be at least 8 characters"
 * />
 *
 * // Textarea
 * <FormField.Textarea
 *   label="Notes"
 *   value={notes}
 *   onChange={(e) => setNotes(e.target.value)}
 *   rows={4}
 *   helperText="Optional notes about this session"
 * />
 * ```
 */

import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";

// ============================================================================
// TYPES
// ============================================================================

interface BaseFieldProps {
  /** Field label */
  label?: string;
  /** Error message (shows error state if provided) */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Wrapper className for the entire field */
  wrapperClassName?: string;
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    BaseFieldProps {}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseFieldProps {}

// ============================================================================
// STYLE CONSTANTS
// ============================================================================

/**
 * Base input styles shared between Input and Textarea
 */
const baseInputStyles = [
  // Layout & sizing
  "w-full px-4 py-3",
  // Typography
  "text-neutral-900",
  "placeholder:text-neutral-400",
  // Border & shape
  "border rounded-xl",
  "border-neutral-300",
  // Background
  "bg-neutral-0",
  // Focus state
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
  // Transition
  "transition-all duration-150",
  // Disabled state
  "disabled:bg-neutral-100",
  "disabled:text-neutral-500",
  "disabled:cursor-not-allowed",
].join(" ");

/**
 * Error state styles
 */
const errorStyles = [
  "border-danger dark:border-danger",
  "focus:ring-danger",
].join(" ");

/**
 * Label styles
 */
const labelStyles = [
  "block text-sm font-medium mb-2",
  "text-neutral-700",
].join(" ");

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Label component
 */
interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

function Label({ htmlFor, required, children, className = "" }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={`${labelStyles} ${className}`}>
      {children}
      {required && <span className="text-accent-red ml-1">*</span>}
    </label>
  );
}

/**
 * Helper/Error text component
 */
interface FieldMessageProps {
  error?: string;
  helperText?: string;
}

function FieldMessage({ error, helperText }: FieldMessageProps) {
  if (!error && !helperText) return null;

  return (
    <p
      className={`mt-1.5 text-sm ${
        error
          ? "text-danger"
          : "text-neutral-500"
      }`}
    >
      {error || helperText}
    </p>
  );
}

/**
 * Input component
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      wrapperClassName = "",
      className = "",
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    const inputClasses = [
      baseInputStyles,
      error ? errorStyles : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

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
          className={inputClasses}
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

/**
 * Textarea component
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      wrapperClassName = "",
      className = "",
      id,
      required,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name;

    const textareaClasses = [
      baseInputStyles,
      "resize-none",
      error ? errorStyles : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

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
          className={textareaClasses}
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

// Main export is Input, with Textarea as compound component
const FormField = Input as typeof Input & {
  Textarea: typeof Textarea;
  Label: typeof Label;
};

FormField.Textarea = Textarea;
FormField.Label = Label;

export default FormField;
