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
  "text-neutral-900 dark:text-neutral-100",
  "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
  // Border & shape
  "border rounded-xl",
  "border-neutral-300 dark:border-neutral-600",
  // Background
  "bg-white dark:bg-neutral-800",
  // Focus state
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
  // Transition
  "transition-all duration-150",
  // Disabled state
  "disabled:bg-neutral-100 dark:disabled:bg-neutral-700",
  "disabled:text-neutral-500 dark:disabled:text-neutral-400",
  "disabled:cursor-not-allowed",
].join(" ");

/**
 * Error state styles
 */
const errorStyles = [
  "border-accent-red dark:border-red-500",
  "focus:ring-red-500",
].join(" ");

/**
 * Label styles
 */
const labelStyles = [
  "block text-sm font-medium mb-2",
  "text-neutral-700 dark:text-neutral-300",
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
          ? "text-accent-red dark:text-red-400"
          : "text-neutral-500 dark:text-neutral-400"
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
