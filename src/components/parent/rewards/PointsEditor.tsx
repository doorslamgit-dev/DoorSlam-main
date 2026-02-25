// src/components/parent/rewards/PointsEditor.tsx
// FEAT-013: Inline points editing component

import AppIcon from '../../ui/AppIcon';

interface PointsEditorProps {
  value: number;
  onChange: (value: number) => void;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function PointsEditor({ 
  value, 
  onChange, 
  onSave, 
  onCancel,
  disabled = false 
}: PointsEditorProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        disabled={disabled}
        min={1}
        className="w-20 px-2 py-1 text-sm border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
      />
      <span className="text-sm text-muted-foreground">pts</span>
      <button
        onClick={onSave}
        disabled={disabled}
        className="p-1 text-success hover:bg-success/10 rounded disabled:opacity-50"
        aria-label="Save points"
      >
        <AppIcon name="check" className="w-4 h-4" />
      </button>
      <button
        onClick={onCancel}
        disabled={disabled}
        className="p-1 text-muted-foreground hover:bg-secondary rounded disabled:opacity-50"
        aria-label="Cancel"
      >
        <AppIcon name="x" className="w-4 h-4" />
      </button>
    </div>
  );
}