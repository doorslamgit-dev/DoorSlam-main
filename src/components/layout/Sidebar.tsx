// src/components/layout/Sidebar.tsx


import { Link } from 'react-router-dom';
import AppIcon from '../ui/AppIcon';
import BrandWordmark from '../ui/BrandWordmark';
import { useSidebar } from '../../contexts/SidebarContext';
import SidebarNav from './sidebar/SidebarNav';
import SidebarBottomSection from './sidebar/SidebarBottomSection';

export default function Sidebar() {
  const { sidebarState, setSidebarState, isMobileOpen, setMobileOpen } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[var(--z-sidebar)] md:hidden p-2 rounded-xl bg-background shadow-sm border border-border"
        aria-label="Open sidebar"
      >
        <AppIcon name="menu" className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[var(--z-mobile-overlay)] bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-background
          border-r border-border
          flex flex-col transition-all duration-300 z-[var(--z-sidebar)]
          ${isCollapsed ? 'w-16' : 'w-60'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        {/* Logo + collapse toggle */}
        <div className={`flex items-center h-16 border-b border-border ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <BrandWordmark size="sm" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setSidebarState(isCollapsed ? 'expanded' : 'collapsed')}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <AppIcon name={isCollapsed ? 'chevron-right' : 'chevron-left'} className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>

        {/* Bottom section */}
        <SidebarBottomSection />
      </aside>
    </>
  );
}
