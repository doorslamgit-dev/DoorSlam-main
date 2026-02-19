// src/components/layout/PersistentFooter.tsx


import AppIcon from '../ui/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';

export default function PersistentFooter() {
  const { isParent } = useAuth();
  const { sidebarState, isAiPanelOpen, setAiPanelOpen } = useSidebar();

  const leftOffset = sidebarState === 'expanded' ? 'md:left-60' : 'md:left-16';
  const rightOffset = isAiPanelOpen ? 'md:right-80' : 'md:right-0';

  return (
    <footer
      className={`
        fixed bottom-0 left-0 right-0 h-14 z-[var(--z-sidebar)]
        bg-neutral-0
        border-t border-neutral-200/60
        flex items-center justify-between px-4
        transition-all duration-300
        ${leftOffset} ${rightOffset}
      `}
    >
      {/* Left side: nudge notification */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <AppIcon name="bell" className="w-4 h-4 text-neutral-400 flex-shrink-0" />
        <span className="text-sm text-neutral-500 truncate">
          No new notifications
        </span>
      </div>

      {/* Right side: CTAs */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isParent && (
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <AppIcon name="calendar" className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <AppIcon name="plus" className="w-4 h-4" />
              <span className="hidden sm:inline">Subject</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <AppIcon name="chart-bar" className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </button>
          </>
        )}

        {/* AI Tutor toggle */}
        <button
          type="button"
          onClick={() => setAiPanelOpen(!isAiPanelOpen)}
          className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${isAiPanelOpen
              ? 'bg-primary-100 text-primary-700'
              : 'text-neutral-600 hover:bg-neutral-100'
            }
          `}
          aria-label="Toggle AI Tutor"
        >
          <AppIcon name="sparkles" className="w-4 h-4" />
          <span className="hidden sm:inline">AI Tutor</span>
        </button>
      </div>
    </footer>
  );
}
