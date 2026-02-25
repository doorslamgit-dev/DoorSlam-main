// src/components/parent/dashboard/SupportTipCard.tsx
// Parent support tip card for Parent Dashboard v2 (FEAT-009)
// FEAT-010: AppIcon with name-based icon keys (theme- and library-safe)

import React from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

const tips: Array<{
  title: string;
  content: string;
  icon: IconKey;
}> = [
  {
    title: "Celebrate small wins",
    content:
      "Acknowledging progress — even completing one session — builds confidence and motivation.",
    icon: "party-popper",
  },
  {
    title: "Keep sessions short",
    content:
      "20-minute focused sessions are more effective than hour-long cramming. Quality over quantity.",
    icon: "clock",
  },
  {
    title: "Create a routine",
    content:
      "Same time, same place helps the brain switch into 'revision mode' more easily.",
    icon: "calendar-check",
  },
  {
    title: "Ask about learning, not grades",
    content:
      "Questions like 'What did you learn today?' are more motivating than 'What did you score?'",
    icon: "message-circle",
  },
  {
    title: "Rest days matter",
    content:
      "The brain consolidates learning during rest. Scheduled breaks prevent burnout.",
    icon: "battery-full",
  },
];

export function SupportTipCard() {
  const tipIndex = new Date().getDay() % tips.length;
  const tip = tips[tipIndex];

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl shadow-sm p-6 border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
          <AppIcon
            name={tip.icon}
            className="w-6 h-6 text-primary-foreground"
            aria-hidden
          />
        </div>

        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            Parent Tip
          </div>
          <h4 className="text-base font-bold text-primary mb-1">
            {tip.title}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tip.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SupportTipCard;
