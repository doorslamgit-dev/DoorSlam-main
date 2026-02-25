// src/components/parent/insights/FocusModeWidget.tsx
// FEAT-008: Focus Mode Impact - ON vs OFF comparison

import AppIcon from "../../ui/AppIcon";
import type { FocusModeComparison } from "../../../types/parent/insightsDashboardTypes";

interface FocusModeWidgetProps {
  data: FocusModeComparison | null;
  loading: boolean;
}

export default function FocusModeWidget({ data, loading }: FocusModeWidgetProps) {
  if (loading) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-6 border border-border animate-pulse">
        <div className="h-6 bg-secondary rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-secondary rounded" />
          <div className="h-32 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  const focusOn = data?.focus_on;
  const focusOff = data?.focus_off;

  const focusIsBetter =
    (focusOn?.avg_confidence_change_percent || 0) >
    (focusOff?.avg_confidence_change_percent || 0);

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary mb-1">Focus Mode Impact</h3>
          <p className="text-xs text-muted-foreground">ON vs OFF comparison</p>
        </div>
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <AppIcon name="bolt" className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-xs font-semibold text-primary mb-3">ON</div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Confidence</span>
                <span
                  className={`font-bold ${
                    (focusOn?.avg_confidence_change_percent || 0) > 0
                      ? "text-success"
                      : "text-muted-foreground"
                  }`}
                >
                  {(focusOn?.avg_confidence_change_percent || 0) > 0 ? "+" : ""}
                  {focusOn?.avg_confidence_change_percent || 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-success h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max((focusOn?.avg_confidence_change_percent || 0) + 50, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-bold text-success">
                  {focusOn?.completion_rate || 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-success h-1.5 rounded-full transition-all"
                  style={{ width: `${focusOn?.completion_rate || 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {focusOn?.session_count || 0} sessions
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg border border-border">
          <div className="text-xs font-semibold text-foreground mb-3">OFF</div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-bold text-foreground">
                  {(focusOff?.avg_confidence_change_percent || 0) > 0 ? "+" : ""}
                  {focusOff?.avg_confidence_change_percent || 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-muted-foreground h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max((focusOff?.avg_confidence_change_percent || 0) + 50, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-bold text-foreground">
                  {focusOff?.completion_rate || 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-muted-foreground h-1.5 rounded-full transition-all"
                  style={{ width: `${focusOff?.completion_rate || 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {focusOff?.session_count || 0} sessions
          </div>
        </div>
      </div>

      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-xs text-foreground">
          <strong>Guidance:</strong>{" "}
          {focusIsBetter && (focusOn?.session_count || 0) >= 2
            ? "Focus Mode is showing better results. Encourage its use."
            : (focusOn?.session_count || 0) < 2
            ? "Not enough Focus Mode data yet. Try using it more often."
            : "Results are similar. Focus Mode may help with tricky topics."}
        </p>
      </div>
    </div>
  );
}
