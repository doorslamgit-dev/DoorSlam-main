// src/components/layout/PageLayout.tsx
// Standard page layout wrapper with optional footer
// FEAT-010: Theme-ready layout component (no icons, no hard-coded colours)

import type { ReactNode } from "react";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  /** Set to true to hide the footer (e.g. for modals or special pages) */
  hideFooter?: boolean;
  /** Custom background colour utility class (token-based) */
  bgColor?: string;
}

/**
 * Standard page layout wrapper with footer.
 * Use this to wrap page content to get a consistent footer across the app.
 */
export default function PageLayout({
  children,
  hideFooter = false,
  bgColor = "bg-neutral-100",
}: PageLayoutProps) {
  return (
    <div className={`min-h-[calc(100vh-73px)] flex flex-col ${bgColor}`}>
      <div className="flex-1">{children}</div>
      {!hideFooter && <Footer />}
    </div>
  );
}
