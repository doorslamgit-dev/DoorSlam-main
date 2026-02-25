// src/components/parent/dashboard/ChildHealthCardGrid.tsx
// Grid container for child health cards (FEAT-009)
// FEAT-010: AppIcon (lucide-react) + theme-ready classes (no FontAwesome, no hex)

import React from "react";
import AppIcon from "../../ui/AppIcon";
import { ChildHealthCard } from "./ChildHealthCard";
import type { ChildHealthCardGridProps } from "../../../types/parent/parentDashboardTypes";

export function ChildHealthCardGrid({
  children,
  onGoToToday,
  onViewInsights,
}: ChildHealthCardGridProps) {
  if (children.length === 0) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-8 border border-border/50 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AppIcon
            name="user-plus"
            className="w-8 h-8 text-primary"
            aria-hidden
          />
        </div>
        <h4 className="text-lg font-bold text-primary mb-2">
          No children added yet
        </h4>
        <p className="text-muted-foreground mb-4">
          Add your first child to get started with revision planning.
        </p>
        <button className="px-6 py-3 bg-primary text-white rounded-pill font-semibold hover:bg-primary/90 transition-colors">
          Add a child
        </button>
      </div>
    );
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-primary">Your Children</h3>
        <button className="text-sm font-medium text-primary hover:text-primary flex items-center gap-2">
          View all activity
          <AppIcon name="arrow-right" className="w-4 h-4" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map((child) => (
          <ChildHealthCard
            key={child.child_id}
            child={child}
            onGoToToday={onGoToToday}
            onViewInsights={onViewInsights}
          />
        ))}
      </div>
    </section>
  );
}

export default ChildHealthCardGrid;
