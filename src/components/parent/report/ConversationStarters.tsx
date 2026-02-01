// src/components/parent/insights/ConversationStarters.tsx
// Conversation starters for Parent Insights report
// FEAT-010: Theme-ready classes (no hard-coded colours, no FontAwesome)

import AppIcon from "../../ui/AppIcon";
import type { ReportData } from "../../../types/parent/insightsReportTypes";

interface ConversationStartersProps {
  childName: string;
  lifetimeSessions: number;
  currentStreak: number;
  strengths: ReportData["strengths"];
  areasForSupport: ReportData["areas_for_support"];
}

export function ConversationStarters({
  childName,
  lifetimeSessions,
  currentStreak,
  strengths,
  areasForSupport,
}: ConversationStartersProps) {
  return (
    <section className="mb-10 report-card">
      <h2 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
        <AppIcon
          name="message-circle"
          className="w-5 h-5 text-primary-600"
          aria-hidden
        />
        <span>Conversation Starters for Teachers</span>
      </h2>

      <p className="text-sm text-neutral-600 mb-4">
        Use these questions to guide discussions with {childName}'s teachers:
      </p>

      <div className="bg-primary-50 rounded-lg p-5 space-y-4 border border-primary-200/40">
        <div>
          <p className="font-medium text-primary-900 mb-1">
            On overall progress:
          </p>
          <p className="text-neutral-700 italic">
            "{childName} has completed {lifetimeSessions} revision sessions. How
            does this align with what you're seeing in class?"
          </p>
        </div>

        {strengths.length > 0 && (
          <div>
            <p className="font-medium text-primary-900 mb-1">On strengths:</p>
            <p className="text-neutral-700 italic">
              "They're showing strong confidence in{" "}
              {strengths[0]?.topic_name}. Are there ways to build on this in
              lessons?"
            </p>
          </div>
        )}

        {areasForSupport.length > 0 && (
          <div>
            <p className="font-medium text-primary-900 mb-1">
              On areas needing support:
            </p>
            <p className="text-neutral-700 italic">
              "{areasForSupport[0]?.topic_name} seems to be more challenging —
              confidence is at {areasForSupport[0]?.confidence_percent}%. What
              additional support would you recommend?"
            </p>
          </div>
        )}

        <div>
          <p className="font-medium text-primary-900 mb-1">
            On study habits:
          </p>
          <p className="text-neutral-700 italic">
            "{childName} has a {currentStreak}-day study streak. Is this
            consistent effort showing in their classwork?"
          </p>
        </div>
      </div>
    </section>
  );
}

export default ConversationStarters;
