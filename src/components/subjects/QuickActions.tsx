// src/components/subjects/QuickActions.tsx

import AppIcon from "../ui/AppIcon";

interface QuickActionsProps {
  onAddTopic?: () => void;
  onRequestReview?: () => void;
  onExportProgress?: () => void;
}

export default function QuickActions({
  onAddTopic,
  onRequestReview,
  onExportProgress,
}: QuickActionsProps) {
  const actions = [
    {
      icon: <AppIcon name="calendar-plus" className="w-5 h-5 text-primary" />,
      iconBg: "bg-primary/10",
      title: "Add Topic",
      description: "Schedule new revision topic",
      onClick: onAddTopic,
    },
    {
      icon: <AppIcon name="rotate-cw" className="w-5 h-5 text-info" />,
      iconBg: "bg-info/10",
      title: "Request Review",
      description: "Revisit a previous topic",
      onClick: onRequestReview,
    },
    {
      icon: <AppIcon name="download" className="w-5 h-5 text-success" />,
      iconBg: "bg-success/10",
      title: "Export Progress",
      description: "Download subject report",
      onClick: onExportProgress,
    },
  ];

  return (
    <div className="bg-background rounded-xl shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-5">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
          >
            <div
              className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center mb-3`}
            >
              {action.icon}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {action.title}
            </p>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
