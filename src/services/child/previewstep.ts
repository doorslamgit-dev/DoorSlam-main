// src/services/child/previewstep.ts

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
import { ConfidenceOption, ConfidenceLevel } from "../../types/child/previewstep";

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
    label: "Very confident",
    description: "I already know this topic well",
    icon: faFaceLaughBeam,
    bgColor: "bg-accent-green/10",
    iconBgColor: "bg-accent-green",
    iconColor: "text-white",
    selectedBorder: "border-accent-green",
  },
  {
    id: "fairly_confident",
    label: "Fairly confident",
    description: "I know some of it but could use a refresher",
    icon: faFaceSmile,
    bgColor: "bg-neutral-50",
    iconBgColor: "bg-primary-200",
    iconColor: "text-primary-600",
    selectedBorder: "border-primary-600",
  },
  {
    id: "bit_unsure",
    label: "A bit unsure",
    description: "I've heard of it but don't know it well",
    icon: faFaceMeh,
    bgColor: "bg-neutral-50",
    iconBgColor: "bg-accent-amber/20",
    iconColor: "text-accent-amber",
    selectedBorder: "border-accent-amber",
  },
  {
    id: "need_help",
    label: "New to me",
    description: "This topic is completely new or very unclear",
    icon: faFaceFrown,
    bgColor: "bg-neutral-50",
    iconBgColor: "bg-accent-red/20",
    iconColor: "text-accent-red",
    selectedBorder: "border-accent-red",
  },
];

export function getIconColorForConfidence(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case "very_confident":
      return "text-accent-green";
    case "fairly_confident":
      return "text-primary-600";
    case "bit_unsure":
      return "text-accent-amber";
    case "need_help":
      return "text-accent-red";
  }
}
