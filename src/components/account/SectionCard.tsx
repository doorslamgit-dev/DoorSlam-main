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
    <div className="bg-background rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AppIcon name={icon} className="w-5 h-5 text-primary dark:text-primary/70" aria-hidden />
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>

        {!editing ? (
          <button
            onClick={onEdit}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-primary dark:text-primary/70 hover:bg-muted transition-colors"
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
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-muted-foreground transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-success transition-colors disabled:cursor-not-allowed"
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
