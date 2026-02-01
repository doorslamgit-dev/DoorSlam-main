// src/components/layout/AppLayout.tsx
// FEAT-010: Layout wrapper (theme-ready classes, no icon usage)

import type React from "react";
import AppHeader from "./AppHeader";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
