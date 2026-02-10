interface NotificationToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  dimmed?: boolean;
}

export function NotificationToggle({
  label,
  description,
  enabled,
  onChange,
  disabled = false,
  dimmed = false,
}: NotificationToggleProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl bg-neutral-50 transition-colors ${
        dimmed ? "opacity-50" : ""
      }`}
    >
      <div>
        <p className="text-sm font-medium text-neutral-700">{label}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          disabled && !dimmed ? "cursor-not-allowed" : ""
        } ${enabled ? "bg-accent-green" : "bg-neutral-200"}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-neutral-0 rounded-full shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
