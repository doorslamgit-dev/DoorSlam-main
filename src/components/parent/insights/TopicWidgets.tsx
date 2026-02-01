// src/components/parent/insights/TopicWidgets.tsx
// FEAT-008: Building Confidence + Needs Attention Widgets
// v2: Uses correct field names from rpc_get_child_confidence_insights

import AppIcon from "../../ui/AppIcon";
import type { TopicInsight } from "../../../types/parent/insightsDashboardTypes";

interface TopicListWidgetProps {
  topics: TopicInsight[];
  loading: boolean;
  variant: "strengths" | "needs-attention";
}

function TopicCard({
  topic,
  variant,
}: {
  topic: TopicInsight;
  variant: "strengths" | "needs-attention";
}) {
  const isStrength = variant === "strengths";
  const bgColor = isStrength ? "bg-accent-green" : "bg-accent-amber";
  const textColor = isStrength ? "text-accent-green" : "text-accent-amber";
  const borderColor = isStrength ? "border-accent-green" : "border-accent-amber";

  const rawConfidence = topic.avg_post_confidence;
  const hasValidConfidence =
    rawConfidence !== null && rawConfidence !== undefined && !isNaN(rawConfidence);

  const confidencePercent = hasValidConfidence ? Math.round((rawConfidence / 4) * 100) : 0;

  const sessionCount = topic.session_count ?? 0;
  const confidenceChange = topic.confidence_change ?? 0;

  return (
    <div className={`p-3 ${bgColor} bg-opacity-5 rounded-lg border ${borderColor} border-opacity-20`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-neutral-900 truncate">{topic.topic_name}</h4>
          <p className="text-xs text-neutral-600">
            {topic.subject_name} • {sessionCount} session{sessionCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right ml-2">
          <div className={`text-xl font-bold ${textColor}`}>
            {hasValidConfidence ? `${confidencePercent}%` : "—"}
          </div>
        </div>
      </div>

      <div className="w-full bg-neutral-200 rounded-full h-1.5 mb-2">
        <div className={`${bgColor} h-1.5 rounded-full transition-all`} style={{ width: `${confidencePercent}%` }} />
      </div>

      {!isStrength && (
        <div className="text-xs text-neutral-600 flex items-center gap-1">
          <AppIcon name="info" className={`w-3.5 h-3.5 ${textColor}`} />
          {!hasValidConfidence
            ? "No confidence data yet"
            : confidenceChange > 0
            ? "Building slowly"
            : confidenceChange < 0
            ? "Confidence fluctuating"
            : "Needs more practice"}
        </div>
      )}
    </div>
  );
}

export function BuildingConfidenceWidget({ topics, loading }: Omit<TopicListWidgetProps, "variant">) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-200 animate-pulse">
        <div className="h-6 bg-neutral-100 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-neutral-100 rounded" />
          <div className="h-20 bg-neutral-100 rounded" />
          <div className="h-20 bg-neutral-100 rounded" />
        </div>
      </div>
    );
  }

  const topTopics = [...topics]
    .filter(
      (t) => t.avg_post_confidence !== null && t.avg_post_confidence !== undefined && !isNaN(t.avg_post_confidence)
    )
    .sort((a, b) => (b.avg_post_confidence ?? 0) - (a.avg_post_confidence ?? 0))
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary-900 mb-1">Building Confidence</h3>
          <p className="text-xs text-neutral-500">Top 3 strongest areas</p>
        </div>
        <div className="w-10 h-10 bg-accent-green bg-opacity-10 rounded-lg flex items-center justify-center">
          <AppIcon name="star" className="w-5 h-5 text-accent-green" />
        </div>
      </div>

      <div className="space-y-3">
        {topTopics.length > 0 ? (
          topTopics.map((topic) => (
            <TopicCard key={topic.topic_id} topic={topic} variant="strengths" />
          ))
        ) : (
          <div className="text-center py-8 text-neutral-400">No session data yet</div>
        )}
      </div>
    </div>
  );
}

export function NeedsAttentionWidget({ topics, loading }: Omit<TopicListWidgetProps, "variant">) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-200 animate-pulse">
        <div className="h-6 bg-neutral-100 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-neutral-100 rounded" />
          <div className="h-20 bg-neutral-100 rounded" />
          <div className="h-20 bg-neutral-100 rounded" />
        </div>
      </div>
    );
  }

  const strugglingTopics = [...topics]
    .filter(
      (t) => t.avg_post_confidence !== null && t.avg_post_confidence !== undefined && !isNaN(t.avg_post_confidence)
    )
    .sort((a, b) => (a.avg_post_confidence ?? 0) - (b.avg_post_confidence ?? 0))
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary-900 mb-1">Where Support Helps Most</h3>
          <p className="text-xs text-neutral-500">3 areas needing attention</p>
        </div>
        <div className="w-10 h-10 bg-accent-amber bg-opacity-10 rounded-lg flex items-center justify-center">
          <AppIcon name="hand-heart" className="w-5 h-5 text-accent-amber" />
        </div>
      </div>

      <div className="space-y-3">
        {strugglingTopics.length > 0 ? (
          strugglingTopics.map((topic) => (
            <TopicCard key={topic.topic_id} topic={topic} variant="needs-attention" />
          ))
        ) : (
          <div className="text-center py-8 text-neutral-400">No concerns to highlight</div>
        )}
      </div>
    </div>
  );
}
