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
        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
      />
      <span className="text-sm text-gray-500">pts</span>
      <button
        onClick={onSave}
        disabled={disabled}
        className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
        aria-label="Save points"
      >
        <AppIcon name="check" className="w-4 h-4" />
      </button>
      <button
        onClick={onCancel}
        disabled={disabled}
        className="p-1 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-50"
        aria-label="Cancel"
      >
        <AppIcon name="x" className="w-4 h-4" />
      </button>
    </div>
  );
}