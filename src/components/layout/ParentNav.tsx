// src/components/layout/ParentNav.tsx
// Parent navigation for main dashboard sections
// FEAT-010: No icons required; theme-ready classes only


import { Link, useLocation } from "react-router-dom";


export default function ParentNav() {
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
      <Link to="/parent" className={linkClass("/parent", true)}>
        Dashboard
      </Link>
      <Link to="/parent/subjects" className={linkClass("/parent/subjects")}>
        Subjects
      </Link>
      <Link to="/parent/timetable" className={linkClass("/parent/timetable")}>
        Timetable
      </Link>
      <Link to="/parent/rewards" className={linkClass("/parent/rewards")}>
        Rewards
      </Link>
      <Link to="/parent/insights" className={linkClass("/parent/insights")}>
        Insights
      </Link>
    </nav>
  );
}
