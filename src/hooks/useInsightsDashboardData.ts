// src/hooks/useInsightsDashboardData.ts

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchAllInsights,
  generateTutorAdvice,
  generateFallbackAdvice,
  fetchParentChildren,
  fetchAnalyticsPreference,
  updateAnalyticsPreference,
} from '../services/parent/insightsDashboardService';
import type {
  DateRangeType,
  AllInsightsData,
  TutorAdvice,
  TopicInsight,
} from '../types/parent/insightsDashboardTypes';

interface Child {
  id: string;
  first_name: string;
  preferred_name: string | null;
}

interface UseInsightsDashboardDataProps {
  userId: string | undefined;
  isParent: boolean;
}

interface UseInsightsDashboardDataReturn {
  children: Child[];
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
  dateRange: DateRangeType;
  setDateRange: (range: DateRangeType) => void;
  insightsData: AllInsightsData | null;
  tutorAdvice: TutorAdvice | null;
  shareAnalytics: boolean;
  isAIAdvice: boolean;
  loadingChildren: boolean;
  loadingInsights: boolean;
  loadingAdvice: boolean;
  error: string | null;
  handleAnalyticsToggle: (enabled: boolean) => Promise<void>;
  getChildName: (childId: string) => string;
  getTopicInsights: () => TopicInsight[];
}

export function useInsightsDashboardData({
  userId,
  isParent,
}: UseInsightsDashboardDataProps): UseInsightsDashboardDataReturn {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeType>('this_week');
  const [insightsData, setInsightsData] = useState<AllInsightsData | null>(null);
  const [tutorAdvice, setTutorAdvice] = useState<TutorAdvice | null>(null);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [isAIAdvice, setIsAIAdvice] = useState(false);

  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiRequestId = useRef(0);

  const getChildName = useCallback((childId: string) => {
    const child = children.find(c => c.id === childId);
    return child?.preferred_name || child?.first_name || 'Child';
  }, [children]);

  // Load children on mount
  useEffect(() => {
    if (!userId || !isParent) return;

    async function loadChildren() {
      setLoadingChildren(true);

      try {
        const { data: childrenData, error: childrenError } = await fetchParentChildren(userId!);

        if (childrenError) throw new Error(childrenError);

        setChildren(childrenData || []);

        if (childrenData && childrenData.length > 0) {
          setSelectedChildId(childrenData[0].id);
        }

        const { data: analyticsEnabled } = await fetchAnalyticsPreference(userId!);
        setShareAnalytics(analyticsEnabled);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingChildren(false);
      }
    }

    loadChildren();
  }, [userId, isParent]);

  // Load insights when child or date range changes
  useEffect(() => {
    if (!selectedChildId) return;

    async function loadInsights() {
      if (!selectedChildId) return;

      setLoadingInsights(true);
      setError(null);

      try {
        const { data, error: insightsError } = await fetchAllInsights(selectedChildId, dateRange);

        if (insightsError) {
          throw new Error(insightsError);
        }

        setInsightsData(data);

        if (data) {
          const childName = getChildName(selectedChildId);
          const fallback = generateFallbackAdvice(childName, data);
          setTutorAdvice(fallback);
          setIsAIAdvice(false);

          generateAIAdviceInBackground(selectedChildId, childName, data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingInsights(false);
      }
    }

    loadInsights();
  }, [selectedChildId, dateRange, getChildName]);

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
    children,
    selectedChildId,
    setSelectedChildId,
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
    getChildName,
    getTopicInsights,
  };
}
