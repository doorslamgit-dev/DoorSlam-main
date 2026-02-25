// src/services/child/completestep.ts

import { ConfidenceOption } from "../../types/child/completestep";
import { getSubjectIcon } from "../../constants/icons";

// Export for backward compatibility
export { getSubjectIcon };
export { getSubjectIcon as getIconFromName };

export const CONFIDENCE_OPTIONS: ConfidenceOption[] = [
  {
    id: "very_confident",
    label: "Got it!",
    description: "I could teach this to a friend",
    icon: "rocket",
    bgColor: "bg-background",
    selectedBg: "bg-success/10",
    selectedBorder: "border-success",
  },
  {
    id: "fairly_confident",
    label: "Pretty good",
    description: "I understand most of it",
    icon: "check-circle",
    bgColor: "bg-background",
    selectedBg: "bg-info/10",
    selectedBorder: "border-blue-500",
  },
  {
    id: "bit_unsure",
    label: "A bit wobbly",
    description: "Some parts are still unclear",
    icon: "circle-help",
    bgColor: "bg-background",
    selectedBg: "bg-warning/10",
    selectedBorder: "border-amber-500",
  },
  {
    id: "need_help",
    label: "Need more practice",
    description: "I'd like to go over this again",
    icon: "hand-heart",
    bgColor: "bg-background",
    selectedBg: "bg-destructive/10",
    selectedBorder: "border-danger",
  },
];
