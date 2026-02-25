// src/components/common/TrafficLight.tsx
// FEAT-010: AppIcon (lucide-react) + theme-ready classes (no FontAwesome)

import AppIcon from "../ui/AppIcon";
import {
  type FeasibilityStatus,
  getStatusColors,
} from "../../services/parentOnboarding/sessionCalculator";

interface TrafficLightProps {
  status: FeasibilityStatus;
  label?: string;
  message: string;
  suggestion?: string | null;
  compact?: boolean;
}

function statusIcon(status: FeasibilityStatus): string {
  switch (status) {
    case "sufficient":
      return "check-circle";
    case "marginal":
      return "triangle-alert";
    case "insufficient":
      return "triangle-alert";
    default:
      return "info";
  }
}

function suggestionIcon(): string {
  return "lightbulb";
}

export default function TrafficLight({
  status,
  label,
  message,
  suggestion,
  compact = false,
}: TrafficLightProps) {
  const colors = getStatusColors(status);
  const icon = statusIcon(status);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} ${colors.border} border`}
      >
        <AppIcon
          name={icon}
          className={`w-4 h-4 ${colors.iconClass}`}
          aria-hidden
        />
        <span className={`text-sm font-medium ${colors.text}`}>
          {label || status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            status === "sufficient"
              ? "bg-success/15"
              : status === "marginal"
              ? "bg-warning/15"
              : "bg-destructive/10"
          }`}
        >
          <AppIcon
            name={icon}
            className={`w-4 h-4 ${colors.iconClass}`}
            aria-hidden
          />
        </div>

        <div className="flex-1 min-w-0">
          {label && (
            <h4 className={`text-sm font-semibold ${colors.text} mb-1`}>
              {label}
            </h4>
          )}
          <p className={`text-sm ${colors.text}`}>{message}</p>

          {suggestion && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-white/50 rounded-lg">
              <AppIcon
                name={suggestionIcon()}
                className="w-4 h-4 text-primary mt-0.5"
                aria-hidden
              />
              <p className="text-sm text-foreground">{suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
