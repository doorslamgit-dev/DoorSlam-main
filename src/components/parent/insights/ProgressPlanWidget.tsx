// src/components/parent/insights/ProgressPlanWidget.tsx
// FEAT-008: Progress vs Plan - Sessions by day comparison

import AppIcon from "../../ui/AppIcon";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyProgress } from "../../../types/parent/insightsDashboardTypes";
import { COLORS } from "../../../constants/colors";

interface ProgressPlanWidgetProps {
  data: WeeklyProgress | null;
  loading: boolean;
}

export default function ProgressPlanWidget({ data, loading }: ProgressPlanWidgetProps) {
  if (loading) {
    return (
      <div className="bg-background rounded-2xl shadow-soft p-6 border border-border animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-60 bg-muted rounded" />
      </div>
    );
  }

  const chartData =
    data?.by_day?.map((day) => ({
      name: day.day_name,
      Planned: day.planned,
      Completed: day.completed,
    })) || [];

  return (
    <div className="bg-background rounded-2xl shadow-soft p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Progress vs Plan</h3>
          <p className="text-xs text-muted-foreground">Planned vs completed sessions</p>
        </div>
      </div>

      <div className="h-60">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.neutral[200]} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: COLORS.neutral[500] }}
                axisLine={{ stroke: COLORS.neutral[200] }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: COLORS.neutral[500] }}
                axisLine={{ stroke: COLORS.neutral[200] }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: COLORS.neutral[0],
                  border: `1px solid ${COLORS.neutral[200]}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="Planned" fill={COLORS.primary[300]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Completed" fill={COLORS.primary[600]} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No session data for this period
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-success/10 dark:bg-success/20 rounded-lg flex items-center justify-center">
            <AppIcon name="trophy" className="w-5 h-5 text-success" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Best Day</div>
            <div className="font-semibold text-sm text-foreground">
              {data?.best_day?.day_name?.trim() || "N/A"}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-warning/10 dark:bg-warning/20 rounded-lg flex items-center justify-center">
            <AppIcon name="triangle-alert" className="w-5 h-5 text-warning" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Hardest Day</div>
            <div className="font-semibold text-sm text-foreground">
              {data?.worst_day?.day_name?.trim() || "None"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
