// src/components/parent/insights/ConfidenceTrendWidget.tsx
// FEAT-008: Confidence Trend - Pre vs Post over sessions
// FEAT-010: Icon standardisation (AppIcon + Lucide) + theme-ready chart colours

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ConfidenceTrend } from "../../../types/parent/insightsDashboardTypes";
import AppIcon from "../../ui/AppIcon";
import { ICON_MAP } from "../../ui/AppIcon";
import { COLORS } from "../../../constants/colors";

interface ConfidenceTrendWidgetProps {
  data: ConfidenceTrend | null;
  loading: boolean;
}

export default function ConfidenceTrendWidget({ data, loading }: ConfidenceTrendWidgetProps) {
  if (loading) {
    return (
      <div className="bg-neutral-0 rounded-2xl shadow-card p-6 border border-neutral-200 animate-pulse">
        <div className="h-6 bg-neutral-100 rounded w-1/3 mb-4" />
        <div className="h-60 bg-neutral-100 rounded" />
      </div>
    );
  }

  // Transform data for Recharts - reverse to show chronological
  const chartData = [...(data?.sessions || [])].reverse().map((session, index) => ({
    name: `S${index + 1}`,
    Pre: session.pre_confidence,
    Post: session.post_confidence,
    topic: session.topic_name,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number; payload?: Record<string, unknown> }>; label?: string }) => {
    if (active && payload && payload.length) {
      const topic = payload[0]?.payload?.topic as string | undefined;
      return (
        <div className="bg-neutral-0 p-3 border border-neutral-200 rounded-lg shadow-sm">
          <p className="text-xs font-medium text-neutral-700 mb-1">{topic || label}</p>
          <p className="text-xs text-neutral-500">
            Pre:{" "}
            <span className="font-semibold" style={{ color: "var(--chart-pre)" }}>
              {payload[0]?.value}%
            </span>
          </p>
          <p className="text-xs text-neutral-500">
            Post:{" "}
            <span className="font-semibold" style={{ color: "var(--chart-post)" }}>
              {payload[1]?.value}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-6 border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary-900 mb-1">Confidence Trend</h3>
          <p className="text-xs text-neutral-500">Pre vs post over last sessions</p>
        </div>

        {/* Optional: keep an icon slot consistent across widgets */}
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <AppIcon icon={ICON_MAP["check-circle"]} className="w-5 h-5 text-primary-600" />
        </div>
      </div>

      {/* Chart */}
      <div className="h-60">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {/* Theme tokens for chart colours live on the container */}
            <div
              style={{
                // Theme-ready color variables pointing to our design system
                "--chart-pre": COLORS.primary[300],
                "--chart-post": COLORS.primary[600],
              } as React.CSSProperties}
              className="w-full h-full"
            >
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.neutral[200]} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: COLORS.neutral[500] }}
                  axisLine={{ stroke: COLORS.neutral[200] }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: COLORS.neutral[500] }}
                  axisLine={{ stroke: COLORS.neutral[200] }}
                />
                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="Pre"
                  stroke="var(--chart-pre)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-pre)", strokeWidth: 0, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Post"
                  stroke="var(--chart-post)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-post)", strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </div>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-neutral-400">
            No confidence data for this period
          </div>
        )}
      </div>

      {/* Lift and Fragile */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-200">
        <div className="p-3 bg-accent-green bg-opacity-5 rounded-lg border border-accent-green border-opacity-20">
          <div className="text-xs text-neutral-500 mb-1">Largest Lift</div>
          <div className="font-bold text-sm text-neutral-900 truncate">
            {data?.largest_lift?.topic_name || "N/A"}
          </div>
          {data?.largest_lift?.change_percent != null && (
            <div className="text-xs text-accent-green">+{data.largest_lift.change_percent}%</div>
          )}
        </div>

        <div className="p-3 bg-accent-amber bg-opacity-5 rounded-lg border border-accent-amber border-opacity-20">
          <div className="text-xs text-neutral-500 mb-1">Most Fragile</div>
          <div className="font-bold text-sm text-neutral-900 truncate">
            {data?.most_fragile?.topic_name || "N/A"}
          </div>
          {data?.most_fragile?.variance != null && (
            <div className="text-xs text-accent-amber">Fluctuating</div>
          )}
        </div>
      </div>
    </div>
  );
}
