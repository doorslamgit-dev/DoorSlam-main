// src/components/layout/ChildNav.tsx
// Child navigation: Today + Rewards
// FEAT-010: Theme-ready classes only
// FEAT-013: Added Rewards link

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ChildNav() {
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
      <Link href="/child/today" className={linkClass("/child/today", true)}>
        Your revision
      </Link>
      <Link href="/child/rewards" className={linkClass("/child/rewards")}>
        Rewards
      </Link>
    </nav>
  );
}
