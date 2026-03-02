// src/contexts/SubjectColorContext.tsx
// Provides palette-based subject colours to all components.
// Works for both parent views (uses selectedChildId) and child views (uses activeChildId).

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSelectedChild } from './SelectedChildContext';
import { fetchChildSubjects } from '../services/timetableService';
import { buildSubjectColorMap } from '../utils/colorUtils';

interface SubjectColorContextValue {
  /** Look up the palette colour for a subject. Falls back to the provided fallback hex. */
  getColor: (subjectId: string, fallback?: string) => string;
  subjectColorMap: Record<string, string>;
}

const SubjectColorContext = createContext<SubjectColorContextValue>({
  getColor: (_subjectId, fallback) => fallback ?? '#94a3b8',
  subjectColorMap: {},
});

export function SubjectColorProvider({ children }: { children: React.ReactNode }) {
  const { activeChildId, isChild } = useAuth();
  const { selectedChildId } = useSelectedChild();
  const [subjectColorMap, setSubjectColorMap] = useState<Record<string, string>>({});

  // Resolve which child ID to use
  const childId = isChild ? activeChildId : selectedChildId;

  useEffect(() => {
    if (!childId) {
      setSubjectColorMap({});
      return;
    }

    let cancelled = false;

    async function load() {
      const { data } = await fetchChildSubjects(childId!);
      if (cancelled) return;
      if (data && data.length > 0) {
        setSubjectColorMap(buildSubjectColorMap(data.map((s) => s.subject_id)));
      } else {
        setSubjectColorMap({});
      }
    }

    load();
    return () => { cancelled = true; };
  }, [childId]);

  function getColor(subjectId: string, fallback?: string): string {
    return subjectColorMap[subjectId] ?? fallback ?? '#94a3b8';
  }

  return (
    <SubjectColorContext.Provider value={{ getColor, subjectColorMap }}>
      {children}
    </SubjectColorContext.Provider>
  );
}

export function useSubjectColor() {
  return useContext(SubjectColorContext);
}
