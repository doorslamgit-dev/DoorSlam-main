
// src/components/parent/dashboard/ResourcesSection.tsx
// Help and resources links for Parent Dashboard v2 (FEAT-009)
// FEAT-010: AppIcon name-based keys (no ICON_MAP usage)

import React from "react";
import { useNavigate } from 'react-router-dom';
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

const resources: Array<{
  title: string;
  description: string;
  icon: IconKey;
  path: string;
}> = [
  {
    title: "Getting Started Guide",
    description: "How to set up effective revision schedules",
    icon: "book",
    path: "/help/getting-started",
  },
  {
    title: "Supporting Your Child",
    description: "Tips for parents during exam season",
    icon: "heart",
    path: "/help/parent-guide",
  },
  {
    title: "Understanding Progress",
    description: "What the metrics mean and how to use them",
    icon: "chart-line",
    path: "/help/progress-guide",
  },
];

export function ResourcesSection() {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <section className="mb-10">
      <h3 className="text-lg font-bold text-primary mb-4">
        Resources & Help
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <button
            key={resource.path}
            onClick={() => handleNavigate(resource.path)}
            className="bg-background rounded-xl p-5 shadow-soft hover:shadow-sm transition-all border border-border/50 group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <AppIcon name={resource.icon} className="w-5 h-5 text-primary" aria-hidden />
              </div>

              <div>
                <div className="text-sm font-semibold text-primary mb-1">
                  {resource.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {resource.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default ResourcesSection;
