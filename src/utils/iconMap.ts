import {
  CheckCircle2,
  Eye,
  Rocket,
  HandHeart,
} from "lucide-react";

export const ICON_MAP = {
  "check-circle": CheckCircle2,
  eye: Eye,
  rocket: Rocket,
  "hand-heart": HandHeart,
} as const;

export type IconKey = keyof typeof ICON_MAP;
