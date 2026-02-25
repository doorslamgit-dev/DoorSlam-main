// src/components/parent/dashboard/HealthScoreCard.tsx
// Health Score widget — compact version matching wireframe


import AppIcon from '../../ui/AppIcon';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import type { BadgeVariant } from '../../ui/Badge';
import { calculateHealthScore } from '../../../utils/healthScore';
import type { ChildSummary, SubjectCoverage } from '../../../types/parent/parentDashboardTypes';
import type { PlanCoverageOverview } from '../../../services/timetableService';

interface HealthScoreCardProps {
  child: ChildSummary | null;
  childCoverage: SubjectCoverage[];
  planOverview: PlanCoverageOverview | null;
  loading?: boolean;
}

const RAG_CONFIG: Record<string, { label: string; badgeVariant: BadgeVariant; ringColor: string }> = {
  on_track: {
    label: 'On Track',
    badgeVariant: 'success',
    ringColor: 'text-accent-green',
  },
  keep_an_eye: {
    label: 'Keep an Eye',
    badgeVariant: 'warning',
    ringColor: 'text-accent-amber',
  },
  needs_attention: {
    label: 'Needs Attention',
    badgeVariant: 'danger',
    ringColor: 'text-accent-red',
  },
};

export function HealthScoreCard({
  child,
  childCoverage,
  planOverview,
  loading = false,
}: HealthScoreCardProps) {
  if (loading) {
    return (
      <div className="bg-neutral-0 rounded-2xl shadow-card p-5 border border-neutral-200/50 animate-pulse h-full">
        <div className="h-5 bg-neutral-200 rounded w-28 mb-3" />
        <div className="h-20 bg-neutral-100 rounded-xl mx-auto w-20 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-neutral-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!child) return null;

  const health = calculateHealthScore({ childCoverage, planOverview });
  const rag = RAG_CONFIG[health.ragStatus] ?? RAG_CONFIG['on_track'];
  const totalSubjects = health.subjectsOnTrack + health.subjectsNeedingAttention;

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-5 border border-neutral-200/50 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-dark">Health Score</h3>
        <Badge variant={rag.badgeVariant} size="sm" badgeStyle="solid">
          {rag.label}
        </Badge>
      </div>

      {/* Score ring — compact */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none" stroke="currentColor" strokeWidth="10"
              className="text-neutral-100"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none" stroke="currentColor" strokeWidth="10"
              strokeDasharray={`${(health.score / 100) * 327} 327`}
              strokeLinecap="round"
              className={rag.ringColor}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-neutral-800">{health.score}</span>
          </div>
        </div>
      </div>

      {/* 4 Sub-metrics — tight rows */}
      <div className="space-y-0 flex-1">
        <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
          <div className="flex items-center gap-1.5">
            <AppIcon name="check-circle" className="w-3.5 h-3.5 text-accent-green" />
            <span className="text-xs text-neutral-600">Subjects on track</span>
          </div>
          <span className="text-xs font-semibold text-neutral-800">
            {health.subjectsOnTrack} of {totalSubjects}
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
          <div className="flex items-center gap-1.5">
            <AppIcon name="triangle-alert" className="w-3.5 h-3.5 text-accent-amber" />
            <span className="text-xs text-neutral-600">Needs attention</span>
          </div>
          <span className="text-xs font-semibold text-neutral-800">
            {health.subjectsNeedingAttention > 0
              ? `${health.subjectsNeedingAttention} subject${health.subjectsNeedingAttention !== 1 ? 's' : ''}`
              : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
          <div className="flex items-center gap-1.5">
            <AppIcon name="chart-bar" className="w-3.5 h-3.5 text-primary-600" />
            <span className="text-xs text-neutral-600">Average coverage</span>
          </div>
          <span className="text-xs font-semibold text-neutral-800">{health.averageCoverage}%</span>
        </div>

        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-1.5">
            <AppIcon name="clock" className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-xs text-neutral-600">Time until exams</span>
          </div>
          <span className="text-xs font-semibold text-neutral-800">
            {health.weeksRemaining > 0 ? `${health.weeksRemaining} weeks` : '—'}
          </span>
        </div>
      </div>

      {/* Ask AI Tutor CTA */}
      <Button variant="primary" size="sm" leftIcon="bot" fullWidth className="mt-4">
        Ask AI Tutor
      </Button>
    </div>
  );
}

export default HealthScoreCard;
