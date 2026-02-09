// src/components/subjects/SubjectCard.tsx
// Updated: AppIcon-only (no FontAwesome)
// FEAT-010: Consistent status colors

import AppIcon from "../ui/AppIcon";
import type { SubjectProgress } from "../../types/subjectProgress";
import { STATUS_COLORS, getSubjectColor } from "../../constants/colors";

interface SubjectCardProps {
  subject: SubjectProgress;
}

// Convert hex color to rgba with alpha
function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// FEAT-010: Consistent status colors
function getStatusStyle(status: string) {
  switch (status) {
    case "in_progress":
      return { label: "On Track", bgColor: STATUS_COLORS.on_track };
    case "needs_attention":
      return { label: "Needs Focus", bgColor: STATUS_COLORS.needs_attention };
    case "completed":
      return { label: "Completed", bgColor: STATUS_COLORS.completed };
    default:
      return { label: "Not Started", bgColor: STATUS_COLORS.not_started };
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
  const statusStyle = getStatusStyle(subject.status);
  const recentlyCovered = subject.recently_covered?.slice(0, 3) || [];
  const comingUp = subject.coming_up?.slice(0, 3) || [];
  const subjectColor = getSubjectColor(subject.subject_name);
  const iconKey = mapSubjectIconToAppIcon(subject.subject_icon);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft p-6">
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
              style={{ color: subjectColor } as any}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              {subject.subject_name}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {subject.exam_type || "GCSE"} • {subject.exam_board_name || "Edexcel"}
            </p>
          </div>
        </div>

        {/* Status badge - solid background with white text */}
        <span
          className="px-3 py-1 text-white text-sm rounded-full font-medium"
          style={{ backgroundColor: statusStyle.bgColor }}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <div className="text-sm mb-2 text-neutral-600 dark:text-neutral-300">
            <span className="font-medium">Recently covered:</span>{" "}
            <span className="text-neutral-500 dark:text-neutral-400">
              {recentlyCovered.length > 0
                ? recentlyCovered.map((t) => t.topic_name).join(", ")
                : "No topics covered yet"}
            </span>
          </div>

          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            <span className="font-medium">Coming up next:</span>{" "}
            <span className="text-neutral-500 dark:text-neutral-400">
              {comingUp.length > 0
                ? comingUp.map((t) => t.topic_name).join(", ")
                : "No upcoming topics scheduled"}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Coverage progress</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-200">
              {subject.completion_percentage}% complete
            </span>
          </div>

          <div className="w-full rounded-full h-2 bg-neutral-200 dark:bg-neutral-700">
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
