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
    bgColor: "bg-white",
    selectedBg: "bg-green-50",
    selectedBorder: "border-green-500",
  },
  {
    id: "fairly_confident",
    label: "Pretty good",
    emoji: "🙂",
    description: "I understand most of it",
    icon: "check",
    bgColor: "bg-white",
    selectedBg: "bg-blue-50",
    selectedBorder: "border-blue-500",
  },
  {
    id: "bit_unsure",
    label: "A bit wobbly",
    emoji: "🤔",
    description: "Some parts are still unclear",
    icon: "circle-question",
    bgColor: "bg-white",
    selectedBg: "bg-amber-50",
    selectedBorder: "border-amber-500",
  },
  {
    id: "need_help",
    label: "Need more practice",
    emoji: "😅",
    description: "I'd like to go over this again",
    icon: "hand-heart",
    bgColor: "bg-white",
    selectedBg: "bg-red-50",
    selectedBorder: "border-red-400",
  },
];
