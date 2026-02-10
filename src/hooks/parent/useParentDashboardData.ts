// src/hooks/parent/useParentDashboardData.ts
// Comprehensive data management hook for Parent Dashboard
// Handles: initial fetch, real-time updates, visibility refresh, navigation refresh

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getParentDashboard } from "../../services/parent/parentDashboardService";
import { supabase } from "../../lib/supabase";
import type { ParentDashboardData } from "../../types/parent/parentDashboardTypes";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseParentDashboardDataOptions {
  /** Enable real-time subscriptions for live updates */
  enableRealtime?: boolean;
  /** Enable visibility change refresh (when tab becomes visible) */
  enableVisibilityRefresh?: boolean;
  /** Minimum time between refreshes in ms (default: 30 seconds) */
  refreshThrottleMs?: number;
  /** Enable polling interval in ms (0 = disabled, default: 0) */
  pollingIntervalMs?: number;
}

interface UseParentDashboardDataResult {
  data: ParentDashboardData | null;
  loading: boolean;
  error: string | null;
  /** Manual refresh function */
  refresh: () => Promise<void>;
  /** Time of last successful fetch */
  lastFetchedAt: Date | null;
  /** Whether data is considered stale (> 5 minutes old) */
  isStale: boolean;
}

const DEFAULT_OPTIONS: UseParentDashboardDataOptions = {
  enableRealtime: true,
  enableVisibilityRefresh: true,
  refreshThrottleMs: 30000, // 30 seconds
  pollingIntervalMs: 0, // disabled by default
};

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function useParentDashboardData(
  options: UseParentDashboardDataOptions = {}
): UseParentDashboardDataResult {
  const { user } = useAuth();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  // Refs for managing subscriptions and throttling
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate if data is stale
  const isStale = lastFetchedAt
    ? Date.now() - lastFetchedAt.getTime() > STALE_THRESHOLD_MS
    : true;

  // Core fetch function with throttling
  const fetchData = useCallback(
    async (force = false) => {
      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        return;
      }

      // Throttle non-forced fetches
      const now = Date.now();
      if (!force && now - lastFetchTimeRef.current < opts.refreshThrottleMs!) {
        return;
      }

      isFetchingRef.current = true;
      setLoading((prev) => (data === null ? true : prev)); // Only show loading on initial fetch
      setError(null);

      try {
        const dashboardData = await getParentDashboard();
        if (dashboardData) {
          setData(dashboardData);
          setLastFetchedAt(new Date());
          lastFetchTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error("[useParentDashboardData] Fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [data, opts.refreshThrottleMs]
  );

  // Public refresh function (always forces refresh)
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Initial fetch when user is available
  useEffect(() => {
    if (user) {
      fetchData(true);
    } else {
      setData(null);
      setLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time subscription for session updates
  useEffect(() => {
    if (!opts.enableRealtime || !user || !data?.children.length) {
      return;
    }

    // Get all child IDs to subscribe to their session updates
    const childIds = data.children.map((c) => c.child_id);

    // Subscribe to revision_sessions changes for these children
    const channel = supabase
      .channel("parent-dashboard-sessions")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "revision_sessions",
          filter: `child_id=in.(${childIds.join(",")})`,
        },
        (_payload) => {
          fetchData(false);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "planned_sessions",
          filter: `child_id=in.(${childIds.join(",")})`,
        },
        (_payload) => {
          fetchData(false);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [opts.enableRealtime, user, data?.children, fetchData]);

  // Visibility change handler - refresh when tab becomes visible
  useEffect(() => {
    if (!opts.enableVisibilityRefresh) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [opts.enableVisibilityRefresh, fetchData]);

  // Optional polling interval
  useEffect(() => {
    if (!opts.pollingIntervalMs || opts.pollingIntervalMs <= 0) {
      return;
    }

    pollingIntervalRef.current = setInterval(() => {
      // Only poll if page is visible
      if (document.visibilityState === "visible") {
        fetchData(false);
      }
    }, opts.pollingIntervalMs);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [opts.pollingIntervalMs, fetchData]);

  // Focus handler - refresh when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchData(false);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastFetchedAt,
    isStale,
  };
}

export default useParentDashboardData;
