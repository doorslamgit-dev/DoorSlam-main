// src/components/layout/PersistentFooter.tsx

import { useNavigate } from 'react-router-dom';
import AppIcon from '../ui/AppIcon';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';

export default function PersistentFooter() {
  const { isParent } = useAuth();
  const { sidebarState, isAiPanelOpen, setAiPanelOpen } = useSidebar();
  const navigate = useNavigate();

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
      {/* Left side: spacer */}
      <div className="flex-1" />

      {/* Centre: CTA buttons */}
      <div className="flex items-center gap-2">
        {isParent && (
          <>
            <Button variant="secondary" size="sm" leftIcon="calendar" onClick={() => navigate('/parent/timetable')}>
              Schedule
            </Button>
            <Button variant="secondary" size="sm" leftIcon="plus" onClick={() => navigate('/parent/subjects')}>
              Add New Subject
            </Button>
            <Button variant="secondary" size="sm" leftIcon="chart-bar" onClick={() => navigate('/parent/insights')}>
              Progress Report
            </Button>
          </>
        )}
      </div>

      {/* Right side: AI Tutor toggle */}
      <div className="flex-1 flex justify-end">
        <button
          type="button"
          onClick={() => setAiPanelOpen(!isAiPanelOpen)}
          className={`
            inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors
            ${isAiPanelOpen
              ? 'bg-primary-100 text-primary-700'
              : 'text-neutral-500 hover:bg-neutral-100'
            }
          `}
          aria-label="Toggle AI Tutor"
        >
          <AppIcon name="settings" className="w-4.5 h-4.5" />
        </button>
      </div>
    </footer>
  );
}
