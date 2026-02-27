// src/hooks/admin/useCurriculumAdmin.ts
// Combined data + actions hook for the curriculum admin page.

import { useCallback, useEffect, useState } from 'react';
import type {
  NormalizationResult,
  ProductionComponent,
  StagingHierarchy,
  StagingRow,
  StagingStatus,
  StagingStatusCounts,
  SubjectOption,
} from '@/types/curriculumAdmin';
import {
  bulkApproveStaging,
  computeStatusCounts,
  deleteStagingBatch,
  fetchProductionHierarchy,
  fetchStagingData,
  fetchSubjectsForAdmin,
  groupStagingIntoHierarchy,
  normalizeStaging,
  updateStagingStatus,
} from '@/services/curriculumAdminService';

interface UseCurriculumAdminReturn {
  // Data
  subjects: SubjectOption[];
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
  stagingData: StagingRow[];
  stagingHierarchy: StagingHierarchy | null;
  statusCounts: StagingStatusCounts | null;
  productionData: ProductionComponent[];

  // Loading / error
  loading: boolean;
  subjectsLoading: boolean;
  error: string | null;

  // Actions
  approveAll: () => Promise<boolean>;
  approveSelected: (rowIds: number[]) => Promise<boolean>;
  rejectSelected: (rowIds: number[]) => Promise<boolean>;
  normalize: () => Promise<NormalizationResult | null>;
  deleteBatch: (batchId: string) => Promise<boolean>;
  updateStatus: (rowIds: number[], status: StagingStatus) => Promise<boolean>;
  refreshData: () => Promise<void>;

  // Action state
  approving: boolean;
  rejecting: boolean;
  normalizing: boolean;
  lastNormalizationResult: NormalizationResult | null;
}

export function useCurriculumAdmin(): UseCurriculumAdminReturn {
  // Subject selection
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  // Data
  const [stagingData, setStagingData] = useState<StagingRow[]>([]);
  const [productionData, setProductionData] = useState<ProductionComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Action state
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [normalizing, setNormalizing] = useState(false);
  const [lastNormalizationResult, setLastNormalizationResult] =
    useState<NormalizationResult | null>(null);

  // Derived state
  const stagingHierarchy = stagingData.length > 0 ? groupStagingIntoHierarchy(stagingData) : null;
  const statusCounts = stagingData.length > 0 ? computeStatusCounts(stagingData) : null;

  // Fetch subjects on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      setSubjectsLoading(true);
      const result = await fetchSubjectsForAdmin();
      if (!mounted) return;

      if (result.error) {
        setError(result.error);
      } else {
        setSubjects(result.data ?? []);
      }
      setSubjectsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch staging + production data when subject changes
  const loadSubjectData = useCallback(async (subjectId: string) => {
    setLoading(true);
    setError(null);

    const [stagingResult, productionResult] = await Promise.all([
      fetchStagingData(subjectId),
      fetchProductionHierarchy(subjectId),
    ]);

    if (stagingResult.error) {
      setError(stagingResult.error);
    } else {
      setStagingData(stagingResult.data ?? []);
    }

    if (productionResult.error) {
      setError((prev) => (prev ? `${prev}; ${productionResult.error}` : productionResult.error));
    } else {
      setProductionData(productionResult.data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      loadSubjectData(selectedSubjectId);
    } else {
      setStagingData([]);
      setProductionData([]);
    }
  }, [selectedSubjectId, loadSubjectData]);

  // Refresh after mutations
  const refreshData = useCallback(async () => {
    if (selectedSubjectId) {
      await loadSubjectData(selectedSubjectId);
    }
  }, [selectedSubjectId, loadSubjectData]);

  // Actions
  const approveAll = useCallback(async (): Promise<boolean> => {
    if (!selectedSubjectId) return false;
    setApproving(true);
    const result = await bulkApproveStaging(selectedSubjectId);
    setApproving(false);

    if (result.error) {
      setError(result.error);
      return false;
    }

    await refreshData();
    return true;
  }, [selectedSubjectId, refreshData]);

  const approveSelected = useCallback(
    async (rowIds: number[]): Promise<boolean> => {
      setApproving(true);
      const result = await updateStagingStatus(rowIds, 'approved');
      setApproving(false);

      if (result.error) {
        setError(result.error);
        return false;
      }

      await refreshData();
      return true;
    },
    [refreshData]
  );

  const rejectSelected = useCallback(
    async (rowIds: number[]): Promise<boolean> => {
      setRejecting(true);
      const result = await updateStagingStatus(rowIds, 'rejected');
      setRejecting(false);

      if (result.error) {
        setError(result.error);
        return false;
      }

      await refreshData();
      return true;
    },
    [refreshData]
  );

  const normalize = useCallback(async (): Promise<NormalizationResult | null> => {
    if (!selectedSubjectId) return null;
    setNormalizing(true);
    const result = await normalizeStaging(selectedSubjectId);
    setNormalizing(false);

    if (result.error) {
      setError(result.error);
      return null;
    }

    setLastNormalizationResult(result.data);
    await refreshData();
    return result.data;
  }, [selectedSubjectId, refreshData]);

  const deleteBatch = useCallback(
    async (batchId: string): Promise<boolean> => {
      const result = await deleteStagingBatch(batchId);

      if (result.error) {
        setError(result.error);
        return false;
      }

      await refreshData();
      return true;
    },
    [refreshData]
  );

  const updateStatus = useCallback(
    async (rowIds: number[], status: StagingStatus): Promise<boolean> => {
      const result = await updateStagingStatus(rowIds, status);

      if (result.error) {
        setError(result.error);
        return false;
      }

      await refreshData();
      return true;
    },
    [refreshData]
  );

  return {
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    stagingData,
    stagingHierarchy,
    statusCounts,
    productionData,
    loading,
    subjectsLoading,
    error,
    approveAll,
    approveSelected,
    rejectSelected,
    normalize,
    deleteBatch,
    updateStatus,
    refreshData,
    approving,
    rejecting,
    normalizing,
    lastNormalizationResult,
  };
}
