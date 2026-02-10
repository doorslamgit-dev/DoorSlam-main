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
    <div className="rounded-2xl p-6 bg-neutral-0 dark:bg-neutral-800 shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-50">
            <AppIcon name="chart-line" className="w-5 h-5 text-primary-600" aria-hidden />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Community Insights Programme
            </h3>
            <p className="text-sm text-neutral-600">
              Share anonymised progress, unlock peer comparisons
            </p>
          </div>
        </div>

        {/* Main toggle */}
        <button
          onClick={handleMainToggle}
          disabled={saving}
          className={`relative w-14 h-7 rounded-full transition-colors disabled:cursor-not-allowed ${
            settings.enabled ? "bg-accent-green" : "bg-neutral-200"
          }`}
          aria-label={settings.enabled ? "Disable community insights sharing" : "Enable community insights sharing"}
        >
          <div
            className={`absolute top-1 w-5 h-5 bg-neutral-0 rounded-full shadow transition-transform ${
              settings.enabled ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Value proposition */}
      <div className="rounded-xl p-4 mb-4 bg-neutral-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <AppIcon name="shield-check" className="w-4 h-4 mt-0.5 text-accent-green" aria-hidden />
            <div>
              <p className="text-sm font-medium text-neutral-900">100% Anonymised</p>
              <p className="text-xs text-neutral-600">No names or identifiable data shared</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AppIcon name="users" className="w-4 h-4 mt-0.5 text-primary-600" aria-hidden />
            <div>
              <p className="text-sm font-medium text-neutral-900">Peer Insights</p>
              <p className="text-xs text-neutral-600">See how your child compares</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AppIcon name="chart-line" className="w-4 h-4 mt-0.5 text-accent-amber" aria-hidden />
            <div>
              <p className="text-sm font-medium text-neutral-900">Better Planning</p>
              <p className="text-xs text-neutral-600">Informed decisions based on real data</p>
            </div>
          </div>
        </div>
      </div>

      {/* What's shared info */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm font-medium mb-4 text-primary-600 hover:text-primary-700 transition-colors"
        type="button"
      >
        <AppIcon name="info" className="w-4 h-4" aria-hidden />
        What data is shared?
        <AppIcon name={showDetails ? "chevron-up" : "chevron-down"} className="w-4 h-4" aria-hidden />
      </button>

      {showDetails && (
        <div className="rounded-xl p-4 mb-4 border bg-primary-50 border-primary-100">
          <p className="text-sm font-medium mb-2 text-neutral-900">
            Data we share (anonymised):
          </p>

          <ul className="text-sm space-y-1 text-neutral-600">
            {[
              "Session completion counts",
              "Topic coverage percentages",
              "Subject progress metrics",
              "Year group & exam board (for grouping)",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <AppIcon name="check" className="w-3.5 h-3.5 text-accent-green" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <p className="text-sm font-medium mt-3 mb-2 text-neutral-900">Never shared:</p>
          <ul className="text-sm space-y-1 text-neutral-600">
            <li className="flex items-center gap-2">
              <AppIcon name="x" className="w-3.5 h-3.5 text-accent-red" aria-hidden />
              Names or personal details
            </li>
            <li className="flex items-center gap-2">
              <AppIcon name="x" className="w-3.5 h-3.5 text-accent-red" aria-hidden />
              Specific answers or responses
            </li>
            <li className="flex items-center gap-2">
              <AppIcon name="x" className="w-3.5 h-3.5 text-accent-red" aria-hidden />
              School name or exact location
            </li>
          </ul>
        </div>
      )}

      {/* Settings (shown when enabled) */}
      {settings.enabled && (
        <div className="space-y-4 pt-4 border-t border-neutral-200">
          {/* Scope selection */}
          <div>
            <label className="text-sm font-medium mb-2 block text-neutral-900">
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
                        ? "border-primary-600 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300 bg-neutral-0"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AppIcon
                        name={scopeIconKey(option.value)}
                        className={`w-4 h-4 mt-0.5 ${isActive ? "text-primary-600" : "text-neutral-500"}`}
                        aria-hidden
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isActive ? "text-primary-700" : "text-neutral-900"
                          }`}
                        >
                          {option.label}
                        </p>
                        <p className="text-xs mt-0.5 text-neutral-600">
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
              <label className="text-sm font-medium mb-2 block text-neutral-900">
                Include in programme
              </label>

              <div className="space-y-2">
                {settings.children.map((child) => (
                  <div
                    key={child.child_id}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50"
                  >
                    <span className="text-sm text-neutral-900">
                      {child.child_name}
                    </span>

                    <button
                      onClick={() => handleChildToggle(child.child_id)}
                      disabled={saving}
                      type="button"
                      className={`relative w-10 h-5 rounded-full transition-colors disabled:cursor-not-allowed ${
                        child.enabled ? "bg-accent-green" : "bg-neutral-200"
                      }`}
                      aria-label={
                        child.enabled
                          ? `Exclude ${child.child_name} from programme`
                          : `Include ${child.child_name} in programme`
                      }
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-neutral-0 rounded-full shadow transition-transform ${
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
      <div className="mt-4 p-3 rounded-xl flex items-center gap-3 bg-accent-amber/10 border border-accent-amber/30">
        <span className="text-lg" aria-hidden>
          🚀
        </span>
        <div>
          <p className="text-sm font-medium text-accent-amber">
            Coming soon
          </p>
          <p className="text-xs text-neutral-700">
            Peer insights dashboard launching Q2 2026
          </p>
        </div>
      </div>
    </div>
  );
}
