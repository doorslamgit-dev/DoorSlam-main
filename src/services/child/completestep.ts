// src/services/child/completestep.ts

import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import {
  faCalculator,
  faBook,
  faFlask,
  faAtom,
  faGlobe,
  faLandmark,
  faDna,
  faFaceLaughBeam,
  faFaceSmile,
  faFaceMeh,
  faFaceFrown,
} from "@fortawesome/free-solid-svg-icons";
import { ConfidenceOption, ConfidenceLevel } from "../../types/child/completestep";

const ICON_MAP: Record<string, IconDefinition> = {
  calculator: faCalculator,
  book: faBook,
  flask: faFlask,
  atom: faAtom,
  globe: faGlobe,
  landmark: faLandmark,
  dna: faDna,
};

export function getIconFromName(iconName?: string): IconDefinition {
  if (!iconName) return faFlask;
  return ICON_MAP[iconName.toLowerCase()] || faFlask;
}

export const CONFIDENCE_OPTIONS: ConfidenceOption[] = [
  {
    id: "very_confident",
    label: "Got it!",
    emoji: "😊",
    description: "I could teach this to a friend",
    icon: faFaceLaughBeam,
    bgColor: "bg-white",
    selectedBg: "bg-green-50",
    selectedBorder: "border-green-500",
  },
  {
    id: "fairly_confident",
    label: "Pretty good",
    emoji: "🙂",
    description: "I understand most of it",
    icon: faFaceSmile,
    bgColor: "bg-white",
    selectedBg: "bg-blue-50",
    selectedBorder: "border-blue-500",
  },
  {
    id: "bit_unsure",
    label: "A bit wobbly",
    emoji: "🤔",
    description: "Some parts are still unclear",
    icon: faFaceMeh,
    bgColor: "bg-white",
    selectedBg: "bg-amber-50",
    selectedBorder: "border-amber-500",
  },
  {
    id: "need_help",
    label: "Need more practice",
    emoji: "😅",
    description: "I'd like to go over this again",
    icon: faFaceFrown,
    bgColor: "bg-white",
    selectedBg: "bg-red-50",
    selectedBorder: "border-red-400",
  },
];
