/**
 * useFormField - Generic form field state management hook
 *
 * A reusable hook that provides type-safe form field management with dirty state tracking
 * and reset functionality. Ideal for multi-step forms, modals, and settings screens.
 *
 * Features:
 * - Type-safe field updates using TypeScript generics
 * - Automatic dirty state tracking for unsaved changes detection
 * - Reset functionality to restore initial values
 * - Flexible updateField method with key-value type inference
 *
 * @example
 * ```tsx
 * type UserForm = {
 *   firstName: string;
 *   lastName: string;
 *   email: string;
 * };
 *
 * function MyForm() {
 *   const { data, isDirty, updateField, reset } = useFormField<UserForm>({
 *     firstName: '',
 *     lastName: '',
 *     email: ''
 *   });
 *
 *   return (
 *     <form>
 *       <input
 *         value={data.firstName}
 *         onChange={(e) => updateField('firstName', e.target.value)}
 *       />
 *       {isDirty && <button onClick={reset}>Reset</button>}
 *     </form>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Result interface returned by useFormField hook
 */
export interface UseFormFieldResult<T> {
  /** Current form data */
  data: T;
  /** Whether the form has unsaved changes */
  isDirty: boolean;
  /** Update a specific field with type safety */
  updateField: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Update multiple fields at once */
  updateFields: (updates: Partial<T>) => void;
  /** Reset form to initial values */
  reset: () => void;
  /** Set entirely new data (also updates initial values) */
  setData: (newData: T) => void;
}

/**
 * Generic form field state management hook
 *
 * @param initialData - Initial form values
 * @returns Form management utilities
 */
export function useFormField<T extends Record<string, unknown>>(
  initialData: T
): UseFormFieldResult<T> {
  const [data, setDataInternal] = useState<T>(initialData);
  const [initialValues, setInitialValues] = useState<T>(initialData);

  /**
   * Update a single field with type safety
   */
  const updateField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setDataInternal((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((updates: Partial<T>) => {
    setDataInternal((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Reset form to initial values
   */
  const reset = useCallback(() => {
    setDataInternal(initialValues);
  }, [initialValues]);

  /**
   * Set entirely new data and update initial values
   */
  const setData = useCallback((newData: T) => {
    setDataInternal(newData);
    setInitialValues(newData);
  }, []);

  /**
   * Check if form has unsaved changes
   */
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialValues);
  }, [data, initialValues]);

  return {
    data,
    isDirty,
    updateField,
    updateFields,
    reset,
    setData,
  };
}
