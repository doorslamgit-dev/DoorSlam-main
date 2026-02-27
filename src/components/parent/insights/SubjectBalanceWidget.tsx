// src/components/parent/insights/SubjectBalanceWidget.tsx
// FEAT-008: Subject Balance - Time distribution pie chart

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { SubjectBalanceData } from '../../../types/parent/insightsDashboardTypes';
import { COLORS } from '../../../constants/colors';

interface SubjectBalanceWidgetProps {
  data: SubjectBalanceData | null;
  loading: boolean;
}

export default function SubjectBalanceWidget({ data, loading }: SubjectBalanceWidgetProps) {
  if (loading) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-6 border border-border animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-48 bg-muted rounded-full mx-auto" style={{ width: 192 }} />
      </div>
    );
  }

  const chartData =
    data?.subjects?.map((s) => ({
      name: s.subject_name,
      value: s.session_count,
      percentage: s.percentage,
    })) || [];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; payload?: Record<string, unknown> }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border rounded-lg shadow-sm">
          <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].value} sessions ({String(payload[0].payload?.percentage)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Subject Balance</h3>
          <p className="text-xs text-muted-foreground">Time distribution</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="h-48">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No subject data for this period
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="space-y-3 mt-4">
        {data?.subjects?.map((subject, index) => (
          <div
            key={subject.subject_id}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.chart[index % COLORS.chart.length] }} />
              <span className="text-sm font-semibold text-foreground">{subject.subject_name}</span>
            </div>
            <span className="text-lg font-bold text-foreground">{subject.percentage}%</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {data && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            {data.total_sessions} sessions • {data.total_minutes} minutes total
          </p>
        </div>
      )}
    </div>
  );
}
