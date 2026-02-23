// src/hooks/useInsightsDashboardData.ts

import { useEffect, useState, useRef } from 'react';
import {
  fetchAllInsights,
  generateTutorAdvice,
  generateFallbackAdvice,
  fetchAnalyticsPreference,
  updateAnalyticsPreference,
} from '../services/parent/insightsDashboardService';
import type {
  DateRangeType,
  AllInsightsData,
  TutorAdvice,
  TopicInsight,
} from '../types/parent/insightsDashboardTypes';

interface UseInsightsDashboardDataProps {
  userId: string | undefined;
  isParent: boolean;
  childId: string | null;
  childName: string;
}

interface UseInsightsDashboardDataReturn {
  dateRange: DateRangeType;
  setDateRange: (range: DateRangeType) => void;
  insightsData: AllInsightsData | null;
  tutorAdvice: TutorAdvice | null;
  shareAnalytics: boolean;
  isAIAdvice: boolean;
  loadingInsights: boolean;
  loadingAdvice: boolean;
  error: string | null;
  handleAnalyticsToggle: (enabled: boolean) => Promise<void>;
  getTopicInsights: () => TopicInsight[];
}

export function useInsightsDashboardData({
  userId,
  isParent,
  childId,
  childName,
}: UseInsightsDashboardDataProps): UseInsightsDashboardDataReturn {
  const [dateRange, setDateRange] = useState<DateRangeType>('this_week');
  const [insightsData, setInsightsData] = useState<AllInsightsData | null>(null);
  const [tutorAdvice, setTutorAdvice] = useState<TutorAdvice | null>(null);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [isAIAdvice, setIsAIAdvice] = useState(false);

  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiRequestId = useRef(0);

  // Load analytics preference on mount
  useEffect(() => {
    if (!userId || !isParent) return;

    async function loadPreference() {
      try {
        const { data: analyticsEnabled } = await fetchAnalyticsPreference(userId!);
        setShareAnalytics(analyticsEnabled);
      } catch (err: unknown) {
        setError((err instanceof Error ? err.message : String(err)));
      }
    }

    loadPreference();
  }, [userId, isParent]);

  // Load insights when child or date range changes
  useEffect(() => {
    if (!childId) return;

    async function loadInsights() {
      if (!childId) return;

      setLoadingInsights(true);
      setError(null);

      try {
        const { data, error: insightsError } = await fetchAllInsights(childId!, dateRange);

        if (insightsError) {
          throw new Error(insightsError);
        }

        setInsightsData(data);

        if (data) {
          const fallback = generateFallbackAdvice(childName, data);
          setTutorAdvice(fallback);
          setIsAIAdvice(false);

          generateAIAdviceInBackground(childId!, childName, data);
        }
      } catch (err: unknown) {
        setError((err instanceof Error ? err.message : String(err)));
      } finally {
        setLoadingInsights(false);
      }
    }

    loadInsights();
  }, [childId, childName, dateRange]);

  async function generateAIAdviceInBackground(
    childId: string,
    childName: string,
    data: AllInsightsData
  ) {
    const currentRequestId = ++aiRequestId.current;
    setLoadingAdvice(true);

    try {
      const { data: aiAdvice, error: aiError } = await generateTutorAdvice(childName, data);

      if (currentRequestId === aiRequestId.current) {
        if (!aiError && aiAdvice) {
          setTutorAdvice(aiAdvice);
          setIsAIAdvice(true);
        }
      }
    } catch {
      // AI failed - fallback already showing
    } finally {
      if (currentRequestId === aiRequestId.current) {
        setLoadingAdvice(false);
      }
    }
  }

  const handleAnalyticsToggle = async (enabled: boolean) => {
    if (!userId) return;
    const { success } = await updateAnalyticsPreference(userId, enabled);
    if (success) {
      setShareAnalytics(enabled);
    }
  };

  const getTopicInsights = (): TopicInsight[] => {
    const improving = insightsData?.top_topics?.improving_topics || [];
    const struggling = insightsData?.top_topics?.struggling_topics || [];

    const allTopics = [...improving, ...struggling];
    const seen = new Set<string>();
    return allTopics.filter(t => {
      if (seen.has(t.topic_id)) return false;
      seen.add(t.topic_id);
      return true;
    });
  };

  return {
    dateRange,
    setDateRange,
    insightsData,
    tutorAdvice,
    shareAnalytics,
    isAIAdvice,
    loadingInsights,
    loadingAdvice,
    error,
    handleAnalyticsToggle,
    getTopicInsights,
  };
}
