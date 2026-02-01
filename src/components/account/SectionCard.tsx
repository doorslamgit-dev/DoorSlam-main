import AppIcon from "../../components/ui/AppIcon";
import type { IconKey } from "../../components/ui/AppIcon";

interface SectionCardProps {
  icon: IconKey;
  title: string;
  children: React.ReactNode;
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function SectionCard({
  icon,
  title,
  children,
  editing,
  saving,
  onEdit,
  onSave,
  onCancel,
}: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AppIcon name={icon} className="w-5 h-5 text-primary-600" aria-hidden />
          <h2 className="text-lg font-semibold text-neutral-700">{title}</h2>
        </div>

        {!editing ? (
          <button
            onClick={onEdit}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-neutral-50 transition-colors"
          >
            <AppIcon name="pencil" className="w-4 h-4" aria-hidden />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={saving}
              type="button"
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-neutral-200 text-neutral-600 transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-accent-green transition-colors disabled:cursor-not-allowed"
            >
              {saving ? (
                <AppIcon name="loader" className="w-4 h-4 animate-spin text-white" aria-hidden />
              ) : (
                <AppIcon name="check" className="w-4 h-4 text-white" aria-hidden />
              )}
              Save
            </button>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
