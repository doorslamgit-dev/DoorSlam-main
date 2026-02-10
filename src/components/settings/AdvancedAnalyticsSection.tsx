import { useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Child } from "../../hooks/useSettingsData";
import AppIcon from "../ui/AppIcon";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AdvancedAnalyticsSectionProps {
  shareAnalytics: boolean;
  children: Child[];
  userId: string;
  onAnalyticsChange: (enabled: boolean) => void;
  onChildrenChange: (children: Child[]) => void;
}

export function AdvancedAnalyticsSection({
  shareAnalytics,
  children,
  userId,
  onAnalyticsChange,
  onChildrenChange,
}: AdvancedAnalyticsSectionProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [childSaveStatus, setChildSaveStatus] = useState<Record<string, SaveStatus>>(
    {}
  );

  const handleToggle = async (enabled: boolean) => {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        share_anonymised_data: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setMessage("Failed to save setting");
      console.error("Analytics toggle error:", error);
    } else {
      onAnalyticsChange(enabled);
      setMessage(enabled ? "Advanced Analytics enabled" : "Advanced Analytics disabled");
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChildFieldUpdate = (
    childId: string,
    field: "school_name" | "school_town" | "school_postcode_prefix",
    value: string
  ) => {
    onChildrenChange(
      children.map((child) =>
        child.id === childId ? { ...child, [field]: value || null } : child
      )
    );
  };

  const handleChildBlur = async (childId: string) => {
    const child = children.find((c) => c.id === childId);
    if (!child) return;

    setChildSaveStatus((prev) => ({ ...prev, [childId]: "saving" }));

    const { error } = await supabase
      .from("children")
      .update({
        school_name: child.school_name,
        school_town: child.school_town,
        school_postcode_prefix: child.school_postcode_prefix,
        updated_at: new Date().toISOString(),
      })
      .eq("id", childId);

    if (error) {
      console.error("Failed to save child school info:", error);
      setChildSaveStatus((prev) => ({ ...prev, [childId]: "error" }));
      setTimeout(
        () => setChildSaveStatus((prev) => ({ ...prev, [childId]: "idle" })),
        3000
      );
    } else {
      setChildSaveStatus((prev) => ({ ...prev, [childId]: "saved" }));
      setTimeout(
        () => setChildSaveStatus((prev) => ({ ...prev, [childId]: "idle" })),
        2000
      );
    }
  };

  const getChildName = (child: Child) => child.preferred_name || child.first_name;

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <AppIcon name="chart-line" className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-neutral-700">Advanced Analytics</h2>
        </div>
      </div>

      {/* Toggle Section */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AppIcon name="shield" className="w-4 h-4 text-neutral-400" />
              <span className="font-medium text-neutral-900">Share anonymised data</span>
            </div>
            <p className="text-sm text-neutral-500">
              When enabled, your child's progress data (without identifying information)
              contributes to cohort averages. This unlocks trend charts, heat maps, and
              comparison with similar students on the Insights page.
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              We never share: names, email, exact school, or location.
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => handleToggle(!shareAnalytics)}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
              shareAnalytics ? "bg-primary-600" : "bg-neutral-200"
            } ${saving ? "opacity-50" : ""}`}
            aria-label="Toggle anonymised analytics sharing"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-neutral-0 transition-transform ${
                shareAnalytics ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Save message */}
        {message && (
          <p
            className={`text-sm mt-3 ${
              message.includes("Failed") ? "text-danger" : "text-success"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* School Info Section */}
      {shareAnalytics && children.length > 0 && (
        <div className="px-6 py-5">
          <p className="text-sm text-neutral-600 mb-4">
            Add school details to enable regional comparisons (optional):
          </p>

          <div className="space-y-4">
            {children.map((child) => (
              <div key={child.id} className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-neutral-900">{getChildName(child)}</h3>

                  {/* Save status indicator */}
                  {childSaveStatus[child.id] === "saving" && (
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <AppIcon name="loader" className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  )}
                  {childSaveStatus[child.id] === "saved" && (
                    <span className="flex items-center gap-1.5 text-xs text-success">
                      <AppIcon name="check" className="w-4 h-4" />
                      Saved
                    </span>
                  )}
                  {childSaveStatus[child.id] === "error" && (
                    <span className="flex items-center gap-1.5 text-xs text-danger">
                      <AppIcon name="triangle-alert" className="w-4 h-4" />
                      Failed to save
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* School Name */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">
                      <span className="inline-flex items-center gap-1">
                        <AppIcon name="graduation-cap" className="w-3.5 h-3.5" />
                        School name
                      </span>
                    </label>
                    <input
                      type="text"
                      value={child.school_name || ""}
                      onChange={(e) =>
                        handleChildFieldUpdate(child.id, "school_name", e.target.value)
                      }
                      onBlur={() => handleChildBlur(child.id)}
                      placeholder="e.g., St Mary's Academy"
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* School Town */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">
                      <span className="inline-flex items-center gap-1">
                        <AppIcon name="map-pin" className="w-3.5 h-3.5" />
                        Town/City
                      </span>
                    </label>
                    <input
                      type="text"
                      value={child.school_town || ""}
                      onChange={(e) =>
                        handleChildFieldUpdate(child.id, "school_town", e.target.value)
                      }
                      onBlur={() => handleChildBlur(child.id)}
                      placeholder="e.g., Manchester"
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Postcode Prefix */}
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">
                      Postcode area
                    </label>
                    <input
                      type="text"
                      value={child.school_postcode_prefix || ""}
                      onChange={(e) =>
                        handleChildFieldUpdate(
                          child.id,
                          "school_postcode_prefix",
                          e.target.value.toUpperCase()
                        )
                      }
                      onBlur={() => handleChildBlur(child.id)}
                      placeholder="e.g., M1, SW1"
                      maxLength={4}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <p className="text-xs text-neutral-400 mt-3">Changes are saved automatically</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
