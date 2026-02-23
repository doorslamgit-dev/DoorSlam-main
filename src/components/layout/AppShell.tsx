// src/components/layout/AppShell.tsx
// Authenticated layout shell: sidebar + main content + persistent footer + AI panel slot


import { useSidebar } from '../../contexts/SidebarContext';
import Sidebar from './Sidebar';
import PersistentFooter from './PersistentFooter';
import AiTutorSlot from './AiTutorSlot';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { sidebarState, isAiPanelOpen } = useSidebar();

  const sidebarPadding = sidebarState === 'expanded' ? 'md:pl-60' : 'md:pl-16';
  const aiPanelPadding = isAiPanelOpen ? 'md:pr-80' : '';

  return (
    <div className="min-h-screen bg-background-secondary">
      <Sidebar />

      <div className={`flex flex-col min-h-screen transition-all duration-300 [background:var(--gradient-main)] ${sidebarPadding} ${aiPanelPadding}`}>
        <main className="flex-1 pb-14">
          {children}
        </main>
      </div>

      <PersistentFooter />
      <AiTutorSlot />
    </div>
  );
}
