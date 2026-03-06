// src/views/admin/PlanningParametersAdmin.tsx
// Admin page for viewing and editing planning parameters

import { useState, useEffect, useCallback } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import {
  fetchPlanningParameters,
  updateParameter,
  invalidateCache,
  type PlanningParametersMap,
} from '@/services/planningParametersService';

const CATEGORY_ORDER = ['coverage', 'goals', 'needs', 'grades', 'priority', 'session'];

const CATEGORY_LABELS: Record<string, string> = {
  coverage: 'Coverage Targets',
  goals: 'Goal Multipliers',
  needs: 'Learning Needs',
  grades: 'Grade Gap Scaling',
  priority: 'Priority Weights',
  session: 'Session Patterns',
};

const CATEGORY_ICONS: Record<string, string> = {
  coverage: 'target',
  goals: 'trophy',
  needs: 'heart',
  grades: 'trending-up',
  priority: 'list-ordered',
  session: 'clock',
};

interface EditState {
  key: string;
  value: string;
}

export default function PlanningParametersAdmin() {
  const [params, setParams] = useState<PlanningParametersMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadParams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      invalidateCache();
      const data = await fetchPlanningParameters();
      setParams(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load parameters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParams();
  }, [loadParams]);

  const handleSave = async () => {
    if (!editing) return;
    const numValue = parseFloat(editing.value);
    if (isNaN(numValue)) {
      setSaveMessage('Invalid number');
      return;
    }

    const param = params?.[editing.key];
    if (param) {
      if (param.min_value !== null && numValue < param.min_value) {
        setSaveMessage(`Minimum: ${param.min_value}`);
        return;
      }
      if (param.max_value !== null && numValue > param.max_value) {
        setSaveMessage(`Maximum: ${param.max_value}`);
        return;
      }
    }

    setSaving(true);
    setSaveMessage(null);
    const result = await updateParameter(editing.key, numValue);

    if (result.success) {
      setSaveMessage('Saved');
      setEditing(null);
      await loadParams();
    } else {
      setSaveMessage(result.error || 'Save failed');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setSaveMessage(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3">
          <AppIcon name="loader" className="w-5 h-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading parameters...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!params) return null;

  // Group by category
  const grouped: Record<string, Array<{ key: string; value: number; label: string; description: string | null; min_value: number | null; max_value: number | null }>> = {};
  for (const [key, param] of Object.entries(params)) {
    const cat = param.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ key, ...param });
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Planning Parameters</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the constants that drive coverage calculations, session recommendations, and
          feasibility assessments across the platform.
        </p>
      </div>

      {saveMessage && !editing && (
        <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-2 text-sm text-success">
          {saveMessage}
        </div>
      )}

      {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((category) => (
        <Card key={category}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <AppIcon
                  name={CATEGORY_ICONS[category] as 'target'}
                  className="w-4 h-4 text-primary"
                />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {CATEGORY_LABELS[category] || category}
              </h2>
            </div>

            <div className="divide-y divide-border">
              {grouped[category].map((param) => {
                const isEditing = editing?.key === param.key;
                return (
                  <div
                    key={param.key}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{param.label}</div>
                      {param.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {param.description}
                        </div>
                      )}
                      {(param.min_value !== null || param.max_value !== null) && (
                        <div className="text-2xs text-muted-foreground mt-0.5">
                          Range: {param.min_value ?? '—'} to {param.max_value ?? '—'}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <>
                          <input
                            type="number"
                            step="any"
                            value={editing.value}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSave();
                              if (e.key === 'Escape') handleCancel();
                            }}
                            className="w-24 px-2 py-1 text-sm rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            autoFocus
                          />
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-1.5 rounded text-success hover:bg-success/10 disabled:opacity-50"
                          >
                            <AppIcon name="check" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted"
                          >
                            <AppIcon name="x" className="w-4 h-4" />
                          </button>
                          {saveMessage && isEditing && (
                            <span className="text-xs text-destructive">{saveMessage}</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-mono font-medium text-foreground w-16 text-right">
                            {param.value}
                          </span>
                          <button
                            onClick={() => {
                              setEditing({ key: param.key, value: String(param.value) });
                              setSaveMessage(null);
                            }}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <AppIcon name="pencil" className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
