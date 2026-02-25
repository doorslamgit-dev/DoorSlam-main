// src/components/layout/ChildNav.tsx
// Child navigation: Today + Rewards
// FEAT-010: Theme-ready classes only
// FEAT-013: Added Rewards link


import { Link, useLocation } from "react-router-dom";


export default function ChildNav() {
  const { pathname } = useLocation();

  const linkClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return `text-base font-semibold transition-all duration-200 pb-1 ${
      active
        ? "text-primary border-b-2 border-primary"
        : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary/50 border-b-2 border-transparent"
    }`;
  };

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link to="/child/today" className={linkClass("/child/today", true)}>
        Your revision
      </Link>
      <Link to="/child/rewards" className={linkClass("/child/rewards")}>
        Rewards
      </Link>
    </nav>
  );
}
