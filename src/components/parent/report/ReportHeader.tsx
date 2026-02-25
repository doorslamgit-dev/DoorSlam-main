// src/components/parent/insights/ReportHeader.tsx
// Report header for Parent Insights report
// FEAT-010: AppIcon + theme-ready classes (no FontAwesome, no indigo/gray literals)

import AppIcon from "../../ui/AppIcon";
import { formatReportDate } from "../../../utils/reportUtils";

interface ReportHeaderProps {
  childName: string;
  generatedAt: string;
  reportDate: string;
}

export function ReportHeader({
  childName,
  generatedAt,
  reportDate,
}: ReportHeaderProps) {
  return (
    <header className="mb-10 border-b-2 border-primary pb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <AppIcon
                name="graduation-cap"
                className="w-5 h-5 text-primary-foreground"
                aria-hidden
              />
            </div>

            <h1 className="text-2xl font-bold text-primary">
              Doorslam Progress Report
            </h1>
          </div>

          <p className="text-lg text-primary font-semibold">
            {childName}
          </p>
        </div>

        <div className="text-right text-sm text-muted-foreground">
          <p>Generated: {formatReportDate(generatedAt)}</p>
          <p>Report Date: {formatReportDate(reportDate)}</p>
        </div>
      </div>
    </header>
  );
}

export default ReportHeader;
