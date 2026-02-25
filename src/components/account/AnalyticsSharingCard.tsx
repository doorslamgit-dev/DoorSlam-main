// src/components/account/AnalyticsSharingCard.tsx

import { useState } from "react";
import AppIcon from "../ui/AppIcon";
import type { IconKey } from "../ui/AppIcon";

interface ChildSharingOption {
  child_id: string;
  child_name: string;
  enabled: boolean;
}

interface AnalyticsSharingSettings {
  enabled: boolean;
  scope: "town" | "county" | "national";
  children: ChildSharingOption[];
}

interface AnalyticsSharingCardProps {
  settings: AnalyticsSharingSettings;
  onSettingsChange: (settings: AnalyticsSharingSettings) => void;
  saving?: boolean;
}

const SCOPE_OPTIONS = [
  { value: "town", label: "Town/City", description: "Compare with students in your area" },
  { value: "county", label: "County/Region", description: "Compare across your county" },
  { value: "national", label: "National", description: "Compare with all UK students" },
] as const;

function scopeIconKey(scope: AnalyticsSharingSettings["scope"]): IconKey {
  switch (scope) {
    case "town":
      return "map-pin";
    case "county":
      return "map";
    case "national":
      return "globe";
    default:
      return "circle-help";
  }
}

export default function AnalyticsSharingCard({
  settings,
  onSettingsChange,
  saving = false,
}: AnalyticsSharingCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleMainToggle = () => {
    onSettingsChange({
      ...settings,
      enabled: !settings.enabled,
    });
  };

  const handleScopeChange = (scope: AnalyticsSharingSettings["scope"]) => {
    onSettingsChange({
      ...settings,
      scope,
    });
  };

  const handleChildToggle = (childId: string) => {
    onSettingsChange({
      ...settings,
      children: settings.children.map((c) =>
        c.child_id === childId ? { ...c, enabled: !c.enabled } : c
      ),
    });
  };

  return (
    <div className="rounded-2xl p-6 bg-background shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/5">
            <AppIcon name="chart-line" className="w-5 h-5 text-primary" aria-hidden />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Community Insights Programme
            </h3>
            <p className="text-sm text-muted-foreground">
              Share anonymised progress, unlock peer comparisons
            </p>
          </div>
        </div>

        {/* Main toggle */}
        <button
          onClick={handleMainToggle}
          disabled={saving}
          className={`relative w-14 h-7 rounded-full transition-colors disabled:cursor-not-allowed ${
            settings.enabled ? "bg-success" : "bg-muted"
          }`}
          aria-label={settings.enabled ? "Disable community insights sharing" : "Enable community insights sharing"}
        >
          <div
            className={`absolute top-1 w-5 h-5 bg-background rounded-full shadow transition-transform ${
              settings.enabled ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Value proposition */}
      <div className="rounded-xl p-4 mb-4 bg-muted">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <AppIcon name="shield-check" className="w-4 h-4 mt-0.5 text-success" aria-hidden />
            <div>
              <p className="text-sm font-medium text-foreground">100% Anonymised</p>
              <p className="text-xs text-muted-foreground">No names or identifiable data shared</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AppIcon name="users" className="w-4 h-4 mt-0.5 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium text-foreground">Peer Insights</p>
              <p className="text-xs text-muted-foreground">See how your child compares</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AppIcon name="chart-line" className="w-4 h-4 mt-0.5 text-warning" aria-hidden />
            <div>
              <p className="text-sm font-medium text-foreground">Better Planning</p>
              <p className="text-xs text-muted-foreground">Informed decisions based on real data</p>
            </div>
          </div>
        </div>
      </div>

      {/* What's shared info */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm font-medium mb-4 text-primary hover:text-primary transition-colors"
        type="button"
      >
        <AppIcon name="info" className="w-4 h-4" aria-hidden />
        What data is shared?
        <AppIcon name={showDetails ? "chevron-up" : "chevron-down"} className="w-4 h-4" aria-hidden />
      </button>

      {showDetails && (
        <div className="rounded-xl p-4 mb-4 border bg-primary/5 border-primary/20">
          <p className="text-sm font-medium mb-2 text-foreground">
            Data we share (anonymised):
          </p>

          <ul className="text-sm space-y-1 text-muted-foreground">
            {[
              "Session completion counts",
              "Topic coverage percentages",
              "Subject progress metrics",
              "Year group & exam board (for grouping)",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <AppIcon name="check" className="w-3.5 h-3.5 text-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <p className="text-sm font-medium mt-3 mb-2 text-foreground">Never shared:</p>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li className="flex items-center gap-2">
              <AppIcon name="x" className="w-3.5 h-3.5 text-destructive" aria-hidden />
              Names or personal details
            </li>
            <li className="flex items-center gap-2">
              <AppIcon name="x" className="w-3.5 h-3.5 text-destructive" aria-hidden />
              Specific answers or responses
            </li>
            <li className="flex items-center gap-2">
              <AppIcon name="x" className="w-3.5 h-3.5 text-destructive" aria-hidden />
              School name or exact location
            </li>
          </ul>
        </div>
      )}

      {/* Settings (shown when enabled) */}
      {settings.enabled && (
        <div className="space-y-4 pt-4 border-t border-border">
          {/* Scope selection */}
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground">
              Comparison scope
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SCOPE_OPTIONS.map((option) => {
                const isActive = settings.scope === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleScopeChange(option.value)}
                    disabled={saving}
                    type="button"
                    className={`p-3 rounded-xl border text-left transition-colors disabled:cursor-not-allowed ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-input bg-background"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AppIcon
                        name={scopeIconKey(option.value)}
                        className={`w-4 h-4 mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                        aria-hidden
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {option.label}
                        </p>
                        <p className="text-xs mt-0.5 text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Per-child toggles (if multiple children) */}
          {settings.children.length > 1 && (
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">
                Include in programme
              </label>

              <div className="space-y-2">
                {settings.children.map((child) => (
                  <div
                    key={child.child_id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted"
                  >
                    <span className="text-sm text-foreground">
                      {child.child_name}
                    </span>

                    <button
                      onClick={() => handleChildToggle(child.child_id)}
                      disabled={saving}
                      type="button"
                      className={`relative w-10 h-5 rounded-full transition-colors disabled:cursor-not-allowed ${
                        child.enabled ? "bg-success" : "bg-muted"
                      }`}
                      aria-label={
                        child.enabled
                          ? `Exclude ${child.child_name} from programme`
                          : `Include ${child.child_name} in programme`
                      }
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-background rounded-full shadow transition-transform ${
                          child.enabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coming soon badge */}
      <div className="mt-4 p-3 rounded-xl flex items-center gap-3 bg-warning/10 border border-accent-amber/30">
        <AppIcon name="rocket" className="w-5 h-5 text-warning flex-shrink-0" aria-hidden />
        <div>
          <p className="text-sm font-medium text-warning">
            Coming soon
          </p>
          <p className="text-xs text-foreground">
            Peer insights dashboard launching Q2 2026
          </p>
        </div>
      </div>
    </div>
  );
}
