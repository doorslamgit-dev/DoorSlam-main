// src/contexts/SidebarContext.tsx
// Layout state management for sidebar, mobile menu, and AI panel


import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type SidebarState = 'expanded' | 'collapsed';

interface SidebarContextType {
  sidebarState: SidebarState;
  isMobileOpen: boolean;
  isAiPanelOpen: boolean;

  toggleSidebar: () => void;
  setSidebarState: (state: SidebarState) => void;
  setMobileOpen: (open: boolean) => void;
  setAiPanelOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'doorslam-sidebar-state';

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarState, setSidebarStateInternal] = useState<SidebarState>('expanded');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isAiPanelOpen, setAiPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'collapsed') {
      setSidebarStateInternal('collapsed');
    }
    setHydrated(true);
  }, []);

  // Persist sidebar state
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, sidebarState);
    }
  }, [sidebarState, hydrated]);

  // Auto-collapse sidebar when AI panel opens
  useEffect(() => {
    if (isAiPanelOpen && sidebarState === 'expanded') {
      setSidebarStateInternal('collapsed');
    }
  }, [isAiPanelOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close mobile sidebar on popstate (back/forward navigation)
  useEffect(() => {
    const handler = () => setMobileOpen(false);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarStateInternal((prev) => (prev === 'expanded' ? 'collapsed' : 'expanded'));
  }, []);

  const setSidebarState = useCallback((state: SidebarState) => {
    setSidebarStateInternal(state);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        sidebarState,
        isMobileOpen,
        isAiPanelOpen,
        toggleSidebar,
        setSidebarState,
        setMobileOpen,
        setAiPanelOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
