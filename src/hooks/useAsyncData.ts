/**
 * useAsyncData - Async data fetching with automatic state management
 *
 * A robust hook for handling asynchronous data fetching with built-in loading,
 * error states, and cleanup. Automatically refetches when dependencies change
 * and prevents memory leaks from unmounted components.
 *
 * Features:
 * - Automatic loading and error state management
 * - Dependency-based refetching
 * - Unmounted component protection
 * - Optional fallback values
 * - Manual refetch capability
 * - Type-safe data handling
 *
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data: user, loading, error, refetch } = useAsyncData(
 *     async () => {
 *       const response = await fetch(`/api/users/${userId}`);
 *       if (!response.ok) throw new Error('Failed to fetch user');
 *       return response.json();
 *     },
 *     [userId], // Refetch when userId changes
 *     { name: 'Unknown', email: '' } // Fallback value
 *   );
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{user.name}</h1>
 *       <p>{user.email}</p>
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With Supabase
 * function GoalsList() {
 *   const { data: goals, loading, error } = useAsyncData(
 *     async () => {
 *       const { data, error } = await supabase
 *         .from('goals')
 *         .select('*')
 *         .order('sort_order');
 *
 *       if (error) throw error;
 *       return data;
 *     },
 *     [],
 *     [] // Empty array as fallback
 *   );
 *
 *   return (
 *     <div>
 *       {loading && <Spinner />}
 *       {!loading && goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Result interface returned by useAsyncData hook
 */
export interface UseAsyncDataResult<T> {
  /** The fetched data, or fallback value if provided */
  data: T;
  /** Whether data is currently being fetched */
  loading: boolean;
  /** Error that occurred during fetch, if any */
  error: Error | null;
  /** Manually trigger a refetch */
  refetch: () => Promise<void>;
}

/**
 * Async data fetching hook with automatic state management
 *
 * @param fetcher - Async function that fetches the data
 * @param deps - Dependency array that triggers refetch when changed
 * @param fallbackValue - Optional fallback value to use during loading or error
 * @returns Data fetching state and utilities
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
  fallbackValue?: T
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T>(fallbackValue as T);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const mountedRef = useRef(true);

  /**
   * Fetch data and update state
   */
  const fetchData = useCallback(async () => {
    // Don't set loading if already unmounted
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();

      // Only update state if still mounted
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      // Only update state if still mounted
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);

        // Keep fallback value on error if provided
        if (fallbackValue !== undefined) {
          setData(fallbackValue);
        }
      }
    } finally {
      // Only update loading state if still mounted
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, fallbackValue]);

  /**
   * Fetch data when component mounts or dependencies change
   */
  useEffect(() => {
    mountedRef.current = true;

    void fetchData();

    // Cleanup: mark component as unmounted
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
