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
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card p-6 border border-neutral-200 dark:border-neutral-700 animate-pulse">
        <div className="h-6 bg-neutral-100 dark:bg-neutral-700 rounded w-1/3 mb-4" />
        <div className="h-60 bg-neutral-100 dark:bg-neutral-700 rounded" />
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
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card p-6 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary-900 dark:text-neutral-100 mb-1">Progress vs Plan</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Planned vs completed sessions</p>
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
          <div className="h-full flex items-center justify-center text-neutral-400 dark:text-neutral-500">
            No session data for this period
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-accent-green bg-opacity-10 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <AppIcon name="trophy" className="w-5 h-5 text-accent-green" />
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Best Day</div>
            <div className="font-semibold text-sm text-neutral-700 dark:text-neutral-200">
              {data?.best_day?.day_name?.trim() || "N/A"}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-accent-amber bg-opacity-10 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <AppIcon name="triangle-alert" className="w-5 h-5 text-accent-amber" />
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Hardest Day</div>
            <div className="font-semibold text-sm text-neutral-700 dark:text-neutral-200">
              {data?.worst_day?.day_name?.trim() || "None"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
