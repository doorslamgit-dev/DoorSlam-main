// src/hooks/parent/rewards/useRewardTemplates.ts
// FEAT-013: Hook for fetching reward templates for a child

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { TemplateConfig, EnabledReward, CategoryCode } from '../../../types/parent/rewardTypes';

interface UseRewardTemplatesResult {
  templates: TemplateConfig | null;
  enabledRewards: EnabledReward[];
  enabledCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useRewardTemplates(childId: string | null): UseRewardTemplatesResult {
  const [templates, setTemplates] = useState<TemplateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!childId) {
      setTemplates(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('rpc_get_reward_templates_for_child', { p_child_id: childId });

      if (rpcError) throw rpcError;
      setTemplates(data as TemplateConfig);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load reward templates');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Derive enabled rewards from templates
  const enabledRewards: EnabledReward[] = templates?.categories?.flatMap(category =>
    (category.templates || [])
      .filter(t => t.is_enabled && t.child_reward_id)
      .map(t => ({
        id: t.child_reward_id!,
        template_id: t.id,
        name: t.name,
        points_cost: t.points_cost,
        category_code: category.code as CategoryCode,
        category_name: category.name,
      }))
  ) || [];

  // Count enabled
  const enabledCount = enabledRewards.length + 
    (templates?.custom_rewards?.filter(r => r.is_active).length || 0);

  return {
    templates,
    enabledRewards,
    enabledCount,
    loading,
    error,
    refresh: fetchTemplates,
  };
}