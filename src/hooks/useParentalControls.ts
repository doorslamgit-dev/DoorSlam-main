// src/hooks/useParentalControls.ts
// Hooks for parental controls — used by both parent (settings) and child (access check)

import { useState, useEffect, useCallback } from "react";
import {
  getParentalControls,
  setParentalControl,
  getPendingControlRequests,
  getChildAccessLevel,
} from "../services/parentalControlsService";
import type {
  AccessLevel,
  ApprovalRequest,
  FeatureKey,
  ParentalControl,
} from "../types/parentalControls";

// ============================================================================
// Parent-side: manage controls + view pending requests
// ============================================================================

interface UseParentalControlsResult {
  controls: ParentalControl[];
  pendingRequests: ApprovalRequest[];
  loading: boolean;
  error: string | null;
  updateControl: (
    featureKey: FeatureKey,
    accessLevel: AccessLevel
  ) => Promise<void>;
  refresh: () => void;
}

export function useParentalControls(
  parentId: string | undefined,
  childId: string | undefined
): UseParentalControlsResult {
  const [controls, setControls] = useState<ParentalControl[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!parentId || !childId) {
      setControls([]);
      setPendingRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [controlsRes, requestsRes] = await Promise.all([
        getParentalControls(parentId, childId),
        getPendingControlRequests(parentId),
      ]);

      if (controlsRes.error) throw new Error(controlsRes.error);
      if (requestsRes.error) throw new Error(requestsRes.error);

      setControls(controlsRes.data ?? []);
      // Filter to only this child's requests
      setPendingRequests(
        (requestsRes.data ?? []).filter((r) => r.child_id === childId)
      );
    } catch (err: unknown) {
      console.error("Error loading parental controls:", err);
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [parentId, childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateControl = useCallback(
    async (featureKey: FeatureKey, accessLevel: AccessLevel) => {
      if (!parentId || !childId) return;

      const result = await setParentalControl(
        parentId,
        childId,
        featureKey,
        accessLevel
      );

      if (!result.success) {
        console.error("Failed to update control:", result.error);
        return;
      }

      // Refresh to get updated state
      await fetchData();
    },
    [parentId, childId, fetchData]
  );

  return {
    controls,
    pendingRequests,
    loading,
    error,
    updateControl,
    refresh: fetchData,
  };
}

// ============================================================================
// Child-side: check access level for a feature
// ============================================================================

interface UseChildAccessResult {
  accessLevel: AccessLevel;
  loading: boolean;
}

export function useChildAccess(
  childId: string | undefined,
  featureKey: FeatureKey
): UseChildAccessResult {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) {
      setAccessLevel("none");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await getChildAccessLevel(childId, featureKey);
      if (!cancelled) {
        setAccessLevel(result.accessLevel);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [childId, featureKey]);

  return { accessLevel, loading };
}
