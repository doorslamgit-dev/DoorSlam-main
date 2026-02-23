import { useState, useEffect, useCallback } from "react";
import {
  fetchSubjectProgress,
} from "../services/subjectProgressService";
import type {
  SubjectProgressData,
} from "../types/subjectProgress";

interface UseSubjectProgressDataProps {
  userId: string | undefined;
  childId: string | null;
}

interface UseSubjectProgressDataReturn {
  data: SubjectProgressData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useSubjectProgressData({
  userId,
  childId,
}: UseSubjectProgressDataProps): UseSubjectProgressDataReturn {
  const [data, setData] = useState<SubjectProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId || !childId) return;

    setLoading(true);
    setError(null);

    const { data: progressData, error: fetchError } = await fetchSubjectProgress(
      userId,
      childId
    );

    if (fetchError) {
      setError(fetchError);
      setData(null);
    } else {
      setData(progressData);
    }

    setLoading(false);
  }, [userId, childId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refreshData: loadData,
  };
}
