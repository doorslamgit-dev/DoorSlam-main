'use client';

// src/components/parent/dashboard/ResourcesSection.tsx
// Help and resources links for Parent Dashboard v2 (FEAT-009)
// FEAT-010: AppIcon name-based keys (no ICON_MAP usage)

import React from "react";
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <section className="mb-10">
      <h3 className="text-lg font-bold text-primary-900 mb-4">
        Resources & Help
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <button
            key={resource.path}
            onClick={() => handleNavigate(resource.path)}
            className="bg-neutral-0 rounded-xl p-5 shadow-soft hover:shadow-card transition-all border border-neutral-200/50 group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                <AppIcon name={resource.icon} className="w-5 h-5 text-primary-600" aria-hidden />
              </div>

              <div>
                <div className="text-sm font-semibold text-primary-900 mb-1">
                  {resource.title}
                </div>
                <div className="text-xs text-neutral-500">
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
