// src/components/subjects/SubjectCard.tsx
// Updated: AppIcon-only (no FontAwesome)
// FEAT-010: Consistent status colors

import AppIcon from "../ui/AppIcon";
import type { SubjectProgress } from "../../types/subjectProgress";
import { getSubjectColor } from "../../constants/colors";
import { hexToRgba } from "../../utils/colorUtils";

interface SubjectCardProps {
  subject: SubjectProgress;
}

function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case "in_progress":
      return { label: "On Track", className: "bg-success/10 text-success" };
    case "needs_attention":
      return { label: "Needs Focus", className: "bg-warning/10 text-warning" };
    case "completed":
      return { label: "Completed", className: "bg-primary/10 text-primary" };
    default:
      return { label: "Not Started", className: "bg-muted text-muted-foreground" };
  }
}

// Map subject_icon keys to AppIcon registry keys
function mapSubjectIconToAppIcon(icon?: string) {
  switch (icon) {
    case "calculator":
      return "circle-question"; // best available in registry (swap when you add a calculator icon)
    case "flask":
      return "circle-question"; // swap when added
    case "book":
      return "book";
    case "dna":
      return "circle-question"; // swap when added
    case "globe":
      return "circle-question"; // swap when added
    case "landmark":
      return "circle-question"; // swap when added
    case "scroll":
      return "circle-question"; // swap when added
    case "atom":
      return "sparkles"; // reasonable stand-in
    case "pray":
      return "hand-heart"; // reasonable stand-in
    case "language":
      return "message-circle"; // reasonable stand-in
    case "palette":
      return "sparkles"; // reasonable stand-in
    case "music":
      return "play"; // reasonable stand-in
    case "laptop-code":
      return "monitor";
    case "running":
      return "rocket"; // reasonable stand-in
    default:
      return "book";
  }
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  const statusBadge = getStatusBadge(subject.status);
  const recentlyCovered = subject.recently_covered?.slice(0, 3) || [];
  const comingUp = subject.coming_up?.slice(0, 3) || [];
  const subjectColor = getSubjectColor(subject.subject_name);
  const iconKey = mapSubjectIconToAppIcon(subject.subject_icon);

  return (
    <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: hexToRgba(subjectColor, 0.1) }}
          >
            <AppIcon
              name={iconKey}
              className="w-5 h-5"
              aria-hidden
              // Lucide icons take currentColor; we set via style for per-subject colour
              style={{ color: subjectColor }}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {subject.subject_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {subject.exam_type || "GCSE"} • {subject.exam_board_name || "Edexcel"}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <div className="text-sm mb-2 text-muted-foreground">
            <span className="font-medium">Recently covered:</span>{" "}
            <span className="text-muted-foreground">
              {recentlyCovered.length > 0
                ? recentlyCovered.map((t) => t.topic_name).join(", ")
                : "No topics covered yet"}
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Coming up next:</span>{" "}
            <span className="text-muted-foreground">
              {comingUp.length > 0
                ? comingUp.map((t) => t.topic_name).join(", ")
                : "No upcoming topics scheduled"}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Coverage progress</span>
            <span className="font-medium text-foreground">
              {subject.completion_percentage}% complete
            </span>
          </div>

          <div className="w-full rounded-full h-2 bg-border">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(subject.completion_percentage, 100)}%`,
                backgroundColor: subjectColor,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
