// src/components/layout/ParentNav.tsx
// Parent navigation for main dashboard sections
// FEAT-010: No icons required; theme-ready classes only

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ParentNav() {
  const pathname = usePathname();

  const linkClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return `text-base font-semibold transition-all duration-200 pb-1 ${
      active
        ? "text-primary-600 border-b-2 border-primary-600"
        : "text-neutral-600 hover:text-primary-600 hover:border-b-2 hover:border-primary-300 border-b-2 border-transparent"
    }`;
  };

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link href="/parent" className={linkClass("/parent", true)}>
        Dashboard
      </Link>
      <Link href="/parent/subjects" className={linkClass("/parent/subjects")}>
        Subjects
      </Link>
      <Link href="/parent/timetable" className={linkClass("/parent/timetable")}>
        Timetable
      </Link>
      <Link href="/parent/rewards" className={linkClass("/parent/rewards")}>
        Rewards
      </Link>
      <Link href="/parent/insights" className={linkClass("/parent/insights")}>
        Insights
      </Link>
    </nav>
  );
}
