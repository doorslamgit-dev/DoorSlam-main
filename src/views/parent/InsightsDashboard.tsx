

// src/views/parent/InsightsDashboard.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import { PageLayout, PageChildHeader, NotificationBanner } from '../../components/layout';
import Alert from '../../components/ui/Alert';
import AppIcon from '../../components/ui/AppIcon';
import { useInsightsDashboardData } from '../../hooks/useInsightsDashboardData';
import { useParentDashboardData } from '../../hooks/parent/useParentDashboardData';

import {
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
  const { selectedChildId, selectedChildName } = useSelectedChild();

  const {
    insightsData,
    tutorAdvice,
    shareAnalytics,
    isAIAdvice,
    loadingInsights,
    loadingAdvice,
    error,
    handleAnalyticsToggle,
    getTopicInsights,
  } = useInsightsDashboardData({
    userId: user?.id,
    isParent,
    childId: selectedChildId,
    childName: selectedChildName,
  });

  // Lightweight child status fetch for notification banner
  const { data: parentData } = useParentDashboardData({ enableRealtime: false, enableVisibilityRefresh: false });
  const selectedChildSummary = parentData?.children.find(c => c.child_id === selectedChildId) || null;
  const showNotificationBanner =
    selectedChildSummary?.status_indicator === 'needs_attention' ||
    selectedChildSummary?.status_indicator === 'keep_an_eye';
  const notificationMessage =
    selectedChildSummary?.status_detail || selectedChildSummary?.insight_message || '';

  // Redirect if not parent
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/', { replace: true });
    } else if (!isParent) {
      navigate('/child/today', { replace: true });
    }
  }, [authLoading, user, isParent, navigate]);

  if (authLoading) {
    return (
      <PageLayout hideFooter>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <AppIcon name="loader" className="text-primary text-2xl animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Loading insights...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user || !isParent) return null;

  return (
    <PageLayout hideFooter>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <PageChildHeader
          title="Insights"
          subtitle={selectedChildName ? `${selectedChildName}'s revision insights` : 'Revision insights'}
          banner={showNotificationBanner ? <NotificationBanner message={notificationMessage} /> : undefined}
        />

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

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
              <span className="text-xs text-muted-foreground">
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
