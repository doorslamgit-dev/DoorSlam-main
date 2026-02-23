// src/components/layout/AiTutorSlot.tsx


import AppIcon from '../ui/AppIcon';
import Button from '../ui/Button';
import { useSidebar } from '../../contexts/SidebarContext';

export default function AiTutorSlot() {
  const { isAiPanelOpen, setAiPanelOpen } = useSidebar();

  if (!isAiPanelOpen) return null;

  return (
    <aside
      className="fixed top-0 right-0 h-full w-80 z-[var(--z-sidebar)] bg-neutral-0 border-l border-neutral-200/60 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200/60">
        <div className="flex items-center gap-2">
          <AppIcon name="sparkles" className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-semibold text-neutral-700">AI Tutor</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAiPanelOpen(false)}
          aria-label="Close AI Tutor"
        >
          <AppIcon name="close" className="w-4 h-4" />
        </Button>
      </div>

      {/* Body placeholder */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <AppIcon name="sparkles" className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-500">AI Tutor coming soon</p>
          <p className="text-xs text-neutral-400 mt-1">
            Your personal study assistant
          </p>
        </div>
      </div>
    </aside>
  );
}
