// src/components/parent/dashboard/ComingUpCard.tsx
// Upcoming sessions card for Parent Dashboard v2 (FEAT-009)
// FEAT-010: AppIcon (lucide-react) + theme-ready classes (no FontAwesome, no hex)

import React from "react";

import AppIcon from "../../ui/AppIcon";
import type { ComingUpCardProps } from "../../../types/parent/parentDashboardTypes";

export function ComingUpCard({
  sessions,
  onViewFullSchedule,
}: ComingUpCardProps) {
  const handleViewAll = () => {
    onViewFullSchedule();
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-6 border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary">Coming Up</h3>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
            <AppIcon
              name="calendar-check"
              className="w-6 h-6 text-muted-foreground"
              aria-hidden
            />
          </div>
          <p className="text-sm text-muted-foreground">
            No upcoming sessions scheduled
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary">Coming Up</h3>
        <button
          onClick={handleViewAll}
          className="text-sm font-medium text-primary hover:text-primary"
        >
          View all
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.planned_session_id}
            className="flex items-center gap-4 p-3 rounded-xl bg-muted hover:bg-secondary transition-colors"
          >
            {/* Avatar */}
            {session.child_avatar_url ? (
              <img
                src={session.child_avatar_url}
                alt={session.child_name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {session.child_name.charAt(0)}
                </span>
              </div>
            )}

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-muted" />
                <span className="text-sm font-semibold text-primary truncate">
                  {session.subject_name}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {session.topic_name}
              </div>
            </div>

            {/* Day label */}
            <div className="text-right flex-shrink-0">
              <div
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  session.is_today
                    ? "bg-success/10 text-success"
                    : session.is_tomorrow
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {session.day_label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComingUpCard;
