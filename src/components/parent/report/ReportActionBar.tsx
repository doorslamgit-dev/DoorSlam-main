// src/components/parent/insights/ReportActionBar.tsx
// Action bar for Parent Insights report
// FEAT-010: AppIcon (lucide-react) + theme-ready classes (no FontAwesome, no hard-coded hex)

import AppIcon from "../../ui/AppIcon";

interface ReportActionBarProps {
  onBack: () => void;
  onPrint: () => void;
}

export function ReportActionBar({ onBack, onPrint }: ReportActionBarProps) {
  return (
    <div className="no-print sticky top-0 bg-background border-b border-border z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <AppIcon name="arrow-right" className="w-4 h-4 rotate-180" aria-hidden />
          <span>Back to Insights</span>
        </button>

        <button
          onClick={onPrint}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2 transition-colors"
        >
          <AppIcon name="printer" className="w-4 h-4" aria-hidden />
          <span>Print / Save as PDF</span>
        </button>
      </div>
    </div>
  );
}

export default ReportActionBar;
