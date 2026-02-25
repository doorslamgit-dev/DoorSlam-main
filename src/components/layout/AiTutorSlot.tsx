// src/components/layout/AiTutorSlot.tsx


import AppIcon from '../ui/AppIcon';
import { useSidebar } from '../../contexts/SidebarContext';

export default function AiTutorSlot() {
  const { isAiPanelOpen, setAiPanelOpen } = useSidebar();

  if (!isAiPanelOpen) return null;

  return (
    <aside
      className="fixed top-0 right-0 h-full w-80 z-[var(--z-sidebar)] bg-background border-l border-border flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AppIcon name="sparkles" className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Tutor</span>
        </div>
        <button
          type="button"
          onClick={() => setAiPanelOpen(false)}
          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close AI Tutor"
        >
          <AppIcon name="close" className="w-4 h-4" />
        </button>
      </div>

      {/* Body placeholder */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <AppIcon name="sparkles" className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">AI Tutor coming soon</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your personal study assistant
          </p>
        </div>
      </div>
    </aside>
  );
}
