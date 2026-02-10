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
    emoji: "😊",
    description: "I could teach this to a friend",
    icon: "rocket",
    bgColor: "bg-neutral-0",
    selectedBg: "bg-success-bg",
    selectedBorder: "border-success",
  },
  {
    id: "fairly_confident",
    label: "Pretty good",
    emoji: "🙂",
    description: "I understand most of it",
    icon: "check",
    bgColor: "bg-neutral-0",
    selectedBg: "bg-info-bg",
    selectedBorder: "border-blue-500",
  },
  {
    id: "bit_unsure",
    label: "A bit wobbly",
    emoji: "🤔",
    description: "Some parts are still unclear",
    icon: "circle-question",
    bgColor: "bg-neutral-0",
    selectedBg: "bg-warning-bg",
    selectedBorder: "border-amber-500",
  },
  {
    id: "need_help",
    label: "Need more practice",
    emoji: "😅",
    description: "I'd like to go over this again",
    icon: "hand-heart",
    bgColor: "bg-neutral-0",
    selectedBg: "bg-danger-bg",
    selectedBorder: "border-danger",
  },
];
