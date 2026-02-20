// src/contexts/SelectedChildContext.tsx
// Global context for parent's selected child — used by sidebar selector + all parent pages.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchChildrenForParent, type ChildOption } from '../services/timetableService';

interface SelectedChildContextValue {
  children: ChildOption[];
  selectedChildId: string | null;
  selectedChildName: string;
  setSelectedChildId: (id: string) => void;
  loading: boolean;
}

const SelectedChildContext = createContext<SelectedChildContextValue>({
  children: [],
  selectedChildId: null,
  selectedChildName: 'Child',
  setSelectedChildId: () => {},
  loading: true,
});

export function SelectedChildProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const { user, isParent } = useAuth();
  const [childList, setChildList] = useState<ChildOption[]>([]);
  const [selectedChildId, setSelectedChildIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !isParent) {
      setLoading(false);
      return;
    }

    async function loadChildren() {
      const { data } = await fetchChildrenForParent(user!.id);
      if (data && data.length > 0) {
        setChildList(data);
        setSelectedChildIdState(data[0].child_id);
      }
      setLoading(false);
    }

    loadChildren();
  }, [user?.id, isParent, user]);

  const setSelectedChildId = useCallback((id: string) => {
    setSelectedChildIdState(id);
  }, []);

  const selectedChildName =
    childList.find((c) => c.child_id === selectedChildId)?.child_name || 'Child';

  return (
    <SelectedChildContext.Provider
      value={{
        children: childList,
        selectedChildId,
        selectedChildName,
        setSelectedChildId,
        loading,
      }}
    >
      {reactChildren}
    </SelectedChildContext.Provider>
  );
}

export function useSelectedChild() {
  return useContext(SelectedChildContext);
}
