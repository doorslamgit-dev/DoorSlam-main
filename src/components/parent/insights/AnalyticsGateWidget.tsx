// src/components/parent/insights/AnalyticsGateWidget.tsx
// FEAT-008: Advanced Analytics Gate - Premium features unlock

import { useState } from "react";
import AppIcon from "../../ui/AppIcon";

interface AnalyticsGateWidgetProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
  loading: boolean;
}

export default function AnalyticsGateWidget({
  enabled,
  onToggle,
  loading,
}: AnalyticsGateWidgetProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    await onToggle(!enabled);
    setIsUpdating(false);
  };

  if (enabled) {
    return (
      <div className="bg-success/10 rounded-2xl p-6 border border-success/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
              <AppIcon name="chart-line" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Advanced Analytics Enabled
              </h3>
              <p className="text-sm text-muted-foreground">
                You're contributing anonymised data and have access to benchmarks
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            {isUpdating ? "Updating..." : "Disable"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 via-white to-primary/10 rounded-2xl shadow-sm p-8 border-2 border-primary/20">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary text-white rounded-full text-xs font-semibold mb-4">
            <AppIcon name="star" className="w-4 h-4" />
            <span>PREMIUM INSIGHTS</span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-2">
            Unlock Advanced Benchmarks
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl">
            See how your child compares with similar learners and get deeper insights into their progress patterns.
          </p>
        </div>
        <div className="hidden lg:block">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
            <AppIcon name="chart-line" className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-background rounded-xl p-5 border border-primary/20">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
            <AppIcon name="target" className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Compare with Peers</h4>
          <p className="text-sm text-muted-foreground">Progress relative to similar learners</p>
        </div>

        <div className="bg-background rounded-xl p-5 border border-primary/20">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
            <AppIcon name="chart-line" className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Progress Percentiles</h4>
          <p className="text-sm text-muted-foreground">Understand engagement standing</p>
        </div>

        <div className="bg-background rounded-xl p-5 border border-primary/20">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
            <AppIcon name="target" className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Goal Gap Analysis</h4>
          <p className="text-sm text-muted-foreground">Track distance from targets</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-5 bg-background rounded-xl border-2 border-primary/50">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggle}
            disabled={isUpdating || loading}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              enabled ? "bg-primary" : "bg-muted"
            } ${isUpdating ? "opacity-50" : ""}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-background transition-transform ${
                enabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <div>
            <div className="font-semibold text-foreground">
              Enable Advanced Benchmarks
            </div>
            <div className="text-sm text-muted-foreground">
              Share anonymised data to unlock premium insights
            </div>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={isUpdating || loading}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium flex items-center space-x-2 disabled:opacity-50"
        >
          {isUpdating ? (
            <AppIcon name="loader" className="w-4 h-4 animate-spin" />
          ) : (
            <AppIcon name="unlock" className="w-4 h-4" />
          )}
          <span>{isUpdating ? "Enabling..." : "Unlock Now"}</span>
        </button>
      </div>
    </div>
  );
}
