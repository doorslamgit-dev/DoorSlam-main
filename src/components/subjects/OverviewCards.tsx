// src/components/subjects/OverviewCards.tsx

import AppIcon from "../ui/AppIcon";
import type { OverviewStats } from "../../types/subjectProgress";

interface OverviewCardsProps {
  overview: OverviewStats;
}

export default function OverviewCards({ overview }: OverviewCardsProps) {
  const cards = [
    {
      icon: (
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <AppIcon name="shield" className="w-6 h-6 text-brand-purple" />
        </div>
      ),
      label: "Coverage Status",
      value:
        overview.coverage_status === "on_track"
          ? "On Track"
          : overview.coverage_status === "ahead"
          ? "Ahead"
          : "Needs Attention",
      subtext: overview.coverage_message,
    },
    {
      icon: (
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <AppIcon name="rotate-cw" className="w-6 h-6 text-blue-500" />
        </div>
      ),
      label: "Recently Revisited",
      value: `${overview.topics_revisited_count} Topic${
        overview.topics_revisited_count !== 1 ? "s" : ""
      }`,
      subtext: "Building confidence through review",
    },
    {
      icon: (
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <AppIcon name="trending-up" className="w-6 h-6 text-green-500" />
        </div>
      ),
      label: "Next Week's Focus",
      value: `${overview.next_week_topics_count} Topic${
        overview.next_week_topics_count !== 1 ? "s" : ""
      }`,
      subtext: `Scheduled across ${overview.next_week_subjects_count} subject${
        overview.next_week_subjects_count !== 1 ? "s" : ""
      }`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="mb-4">{card.icon}</div>
          <p className="text-sm text-gray-500 mb-1">{card.label}</p>
          <p className="text-2xl font-semibold text-gray-900 mb-3">
            {card.value}
          </p>
          <p className="text-xs text-gray-600">{card.subtext}</p>
        </div>
      ))}
    </div>
  );
}
