// src/services/child/previewstep.ts

import { ConfidenceOption, ConfidenceLevel } from "../../types/child/previewstep";
import { getSubjectIcon } from "../../constants/icons";

// Export for backward compatibility
export { getSubjectIcon };
export { getSubjectIcon as getIconFromName };

export const CONFIDENCE_OPTIONS: ConfidenceOption[] = [
  {
    id: "very_confident",
    label: "Very confident",
    description: "I already know this topic well",
    icon: "rocket",
    bgColor: "bg-success/10",
    iconBgColor: "bg-success",
    iconColor: "text-white",
    selectedBorder: "border-accent-green",
  },
  {
    id: "fairly_confident",
    label: "Fairly confident",
    description: "I know some of it but could use a refresher",
    icon: "check",
    bgColor: "bg-muted",
    iconBgColor: "bg-primary/20",
    iconColor: "text-primary",
    selectedBorder: "border-primary",
  },
  {
    id: "bit_unsure",
    label: "A bit unsure",
    description: "I've heard of it but don't know it well",
    icon: "circle-question",
    bgColor: "bg-muted",
    iconBgColor: "bg-warning/20",
    iconColor: "text-warning",
    selectedBorder: "border-accent-amber",
  },
  {
    id: "need_help",
    label: "New to me",
    description: "This topic is completely new or very unclear",
    icon: "hand-heart",
    bgColor: "bg-muted",
    iconBgColor: "bg-destructive/20",
    iconColor: "text-destructive",
    selectedBorder: "border-accent-red",
  },
];

export function getIconColorForConfidence(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case "very_confident":
      return "text-success";
    case "fairly_confident":
      return "text-primary";
    case "bit_unsure":
      return "text-warning";
    case "need_help":
      return "text-destructive";
  }
}
