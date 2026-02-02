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
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AppIcon name={icon} className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden />
          <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">{title}</h2>
        </div>

        {!editing ? (
          <button
            onClick={onEdit}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
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
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors disabled:cursor-not-allowed"
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
