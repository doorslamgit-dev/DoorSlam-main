// src/services/parentalControlsService.ts
// CRUD operations for parental controls and approval requests

import { supabase } from '../lib/supabase';
import type {
  AccessLevel,
  ApprovalRequest,
  ApprovalRequestStatus,
  FeatureKey,
  ParentalControl,
} from '../types/parentalControls';

// ============================================================================
// Parental Controls — CRUD
// ============================================================================

/**
 * Get all parental controls for a specific child
 */
export async function getParentalControls(
  parentId: string,
  childId: string
): Promise<{ data: ParentalControl[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('rpc_get_parental_controls', {
      p_parent_id: parentId,
      p_child_id: childId,
    });

    if (error) throw error;

    return { data: (data as ParentalControl[]) ?? [], error: null };
  } catch (err: unknown) {
    console.error('Error fetching parental controls:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch parental controls',
    };
  }
}

/**
 * Set (upsert) a parental control for a child + feature
 */
export async function setParentalControl(
  parentId: string,
  childId: string,
  featureKey: FeatureKey,
  accessLevel: AccessLevel
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('rpc_set_parental_control', {
      p_parent_id: parentId,
      p_child_id: childId,
      p_feature_key: featureKey,
      p_access_level: accessLevel,
    });

    if (error) throw error;

    const result = data as { success: boolean } | null;
    return { success: result?.success ?? false, error: null };
  } catch (err: unknown) {
    console.error('Error setting parental control:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to set parental control',
    };
  }
}

/**
 * Get the access level for a child on a specific feature
 */
export async function getChildAccessLevel(
  childId: string,
  featureKey: FeatureKey
): Promise<{ accessLevel: AccessLevel; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('rpc_get_child_access_level', {
      p_child_id: childId,
      p_feature_key: featureKey,
    });

    if (error) throw error;

    return { accessLevel: (data as AccessLevel) ?? 'none', error: null };
  } catch (err: unknown) {
    console.error('Error fetching child access level:', err);
    return {
      accessLevel: 'none',
      error: err instanceof Error ? err.message : 'Failed to fetch access level',
    };
  }
}

// ============================================================================
// Approval Requests
// ============================================================================

/**
 * Submit an approval request (called by child)
 */
export async function submitApprovalRequest(
  childId: string,
  featureKey: FeatureKey,
  requestType: string,
  requestData: Record<string, unknown>
): Promise<{ success: boolean; requestId: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('rpc_submit_approval_request', {
      p_child_id: childId,
      p_feature_key: featureKey,
      p_request_type: requestType,
      p_request_data: requestData,
    });

    if (error) throw error;

    const result = data as { success: boolean; request_id?: string } | null;
    return {
      success: result?.success ?? false,
      requestId: result?.request_id ?? null,
      error: null,
    };
  } catch (err: unknown) {
    console.error('Error submitting approval request:', err);
    return {
      success: false,
      requestId: null,
      error: err instanceof Error ? err.message : 'Failed to submit request',
    };
  }
}

/**
 * Resolve (approve/reject) an approval request (called by parent)
 */
export async function resolveApprovalRequest(
  requestId: string,
  status: ApprovalRequestStatus
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('rpc_resolve_approval_request', {
      p_request_id: requestId,
      p_status: status,
    });

    if (error) throw error;

    const result = data as { success: boolean } | null;
    return { success: result?.success ?? false, error: null };
  } catch (err: unknown) {
    console.error('Error resolving approval request:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to resolve request',
    };
  }
}

/**
 * Get all pending approval requests for a parent
 */
export async function getPendingControlRequests(
  parentId: string
): Promise<{ data: ApprovalRequest[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('rpc_get_pending_control_requests', {
      p_parent_id: parentId,
    });

    if (error) throw error;

    return { data: (data as ApprovalRequest[]) ?? [], error: null };
  } catch (err: unknown) {
    console.error('Error fetching pending requests:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch pending requests',
    };
  }
}
