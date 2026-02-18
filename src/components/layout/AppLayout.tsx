// src/components/layout/AppLayout.tsx
// Conditional layout: authenticated users get AppShell (sidebar), others get AppHeader


import type React from "react";
import { useAuth } from "../../contexts/AuthContext";
import AppHeader from "./AppHeader";
import AppShell from "./AppShell";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();

  // Loading: neutral layout (no header, no sidebar) to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Authenticated: sidebar shell
  if (user) {
    return <AppShell>{children}</AppShell>;
  }

  // Unauthenticated: header layout (landing, login, signup)
  return (
    <div className="min-h-screen bg-background-secondary flex flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
