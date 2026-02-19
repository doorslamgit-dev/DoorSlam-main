

// src/views/parent/InsightsDashboard.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLayout } from '../../components/layout';
import Alert from '../../components/ui/Alert';
import AppIcon from '../../components/ui/AppIcon';
import { useInsightsDashboardData } from '../../hooks/useInsightsDashboardData';

import {
  HeroStoryWidget,
  ProgressPlanWidget,
  ConfidenceTrendWidget,
  FocusModeWidget,
  MomentumWidget,
  BuildingConfidenceWidget,
  NeedsAttentionWidget,
  SubjectBalanceWidget,
  ConfidenceHeatmapWidget,
  TutorAdviceWidget,
  AnalyticsGateWidget,
} from '../../components/parent/insights';

export default function InsightsDashboard() {
  const navigate = useNavigate();
  const { user, isParent, loading: authLoading } = useAuth();

  const {
    children,
    selectedChildId,
    dateRange,
    setDateRange,
    insightsData,
    tutorAdvice,
    shareAnalytics,
    isAIAdvice,
    loadingChildren,
    loadingInsights,
    loadingAdvice,
    error,
    handleAnalyticsToggle,
    getTopicInsights,
  } = useInsightsDashboardData({ userId: user?.id, isParent });

  // Redirect if not parent
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/', { replace: true });
    } else if (!isParent) {
      navigate('/child/today', { replace: true });
    }
  }, [authLoading, user, isParent, navigate]);

  const handleExport = () => {
    if (selectedChildId) {
      window.open(`/parent/insights/report?childId=${selectedChildId}`, '_blank');
    }
  };

  if (authLoading || loadingChildren) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <AppIcon name="loader" className="text-primary-600 text-2xl animate-spin mb-3" />
            <p className="text-sm text-neutral-600">Loading insights...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user || !isParent) return null;

  const selectedChild = children.find(c => c.id === selectedChildId);
  const childName = selectedChild?.preferred_name || selectedChild?.first_name || 'Child';

  return (
    <PageLayout>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <section className="mb-8">
          <HeroStoryWidget
            childName={childName}
            summary={insightsData?.summary || null}
            advice={tutorAdvice}
            loading={loadingInsights}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onExport={handleExport}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProgressPlanWidget
            data={insightsData?.weekly_progress || null}
            loading={loadingInsights}
          />

          <ConfidenceTrendWidget
            data={insightsData?.confidence_trend || null}
            loading={loadingInsights}
          />

          <FocusModeWidget
            data={insightsData?.focus_comparison || null}
            loading={loadingInsights}
          />

          <MomentumWidget
            summary={insightsData?.summary || null}
            loading={loadingInsights}
          />

          <BuildingConfidenceWidget
            topics={getTopicInsights()}
            loading={loadingInsights}
          />

          <NeedsAttentionWidget
            topics={getTopicInsights()}
            loading={loadingInsights}
          />

          <SubjectBalanceWidget
            data={insightsData?.subject_balance || null}
            loading={loadingInsights}
          />

          <ConfidenceHeatmapWidget
            data={insightsData?.confidence_heatmap || null}
            loading={loadingInsights}
          />
        </div>

        <section className="mb-8">
          <TutorAdviceWidget
            advice={tutorAdvice}
            loading={loadingInsights}
            isAIGenerated={isAIAdvice}
          />
          {loadingAdvice && tutorAdvice && (
            <div className="mt-2 text-center">
              <span className="text-xs text-neutral-400">
                <AppIcon name="loader" className="animate-spin mr-1" />
                Enhancing with AI insights...
              </span>
            </div>
          )}
        </section>

        <section className="mb-8">
          <AnalyticsGateWidget
            enabled={shareAnalytics}
            onToggle={handleAnalyticsToggle}
            loading={loadingInsights}
          />
        </section>
      </main>
    </PageLayout>
  );
}
