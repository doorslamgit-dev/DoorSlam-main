

// src/components/parent/dashboard/QuickActionsSection.tsx
// Quick action buttons for Parent Dashboard v2 (FEAT-009)
// FEAT-010: AppIcon name-based keys (theme-ready)

import React from "react";
import { useNavigate } from 'react-router-dom';
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface QuickAction {
  label: string;
  icon: IconKey;
  path: string;
  description: string;
}

const actions: QuickAction[] = [
  {
    label: "View Schedule",
    icon: "calendar",
    path: "/parent/timetable",
    description: "See all planned sessions",
  },
  {
    label: "Add Subject",
    icon: "plus",
    path: "/parent/subjects",
    description: "Add or manage subjects",
  },
  {
    label: "Progress Report",
    icon: "chart-bar",
    path: "/parent/insights",
    description: "Detailed analytics",
  },
  {
    label: "Settings",
    icon: "settings",
    path: "/parent/settings",
    description: "Preferences & account",
  },
];

export function QuickActionsSection() {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <section className="mb-10">
      <h3 className="text-lg font-bold text-primary mb-4">Quick Actions</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => handleNavigate(action.path)}
            className="bg-background rounded-xl p-4 shadow-soft hover:shadow-sm transition-all border border-border/50 text-left group"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <AppIcon name={action.icon} className="w-5 h-5 text-primary" aria-hidden />
            </div>

            <div className="text-sm font-semibold text-primary">
              {action.label}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {action.description}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickActionsSection;
