import { useState, useEffect, useCallback } from "react";
import {
  fetchSubjectProgress,
  fetchChildrenForParent,
} from "../services/subjectProgressService";
import type {
  SubjectProgressData,
  ChildOption,
} from "../types/subjectProgress";

interface UseSubjectProgressDataProps {
  userId: string | undefined;
}

interface UseSubjectProgressDataReturn {
  data: SubjectProgressData | null;
  children: ChildOption[];
  selectedChildId: string | null;
  loading: boolean;
  error: string | null;
  setSelectedChildId: (id: string) => void;
  refreshData: () => Promise<void>;
}

export function useSubjectProgressData({
  userId,
}: UseSubjectProgressDataProps): UseSubjectProgressDataReturn {
  const [data, setData] = useState<SubjectProgressData | null>(null);
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function loadChildren() {
      const { data: childrenData } = await fetchChildrenForParent(userId!);
      if (childrenData && childrenData.length > 0) {
        setChildren(childrenData);
        setSelectedChildId(childrenData[0].child_id);
      } else {
        setLoading(false);
      }
    }

    loadChildren();
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId || !selectedChildId) return;

    setLoading(true);
    setError(null);

    const { data: progressData, error: fetchError } = await fetchSubjectProgress(
      userId,
      selectedChildId
    );

    if (fetchError) {
      setError(fetchError);
      setData(null);
    } else {
      setData(progressData);
    }

    setLoading(false);
  }, [userId, selectedChildId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    children,
    selectedChildId,
    loading,
    error,
    setSelectedChildId,
    refreshData: loadData,
  };
}
