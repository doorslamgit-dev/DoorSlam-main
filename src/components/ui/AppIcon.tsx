// src/components/ui/AppIcon.tsx
// Centralised Lucide icon wrapper + icon registry
// FEAT-010: Single source of truth for UI icons
// FEAT-013: Added reward system icons (gift, wallet, pencil, trash, monitor, candy, ticket, crown)

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Book,
  BookOpen,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Candy,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleHelp,
  Clock,
  Coins,
  Crown,
  Eye,
  Flame,
  Gift,
  GraduationCap,
  HandHeart,
  Heart,
  Hourglass,
  Info,
  Lightbulb,
  LineChart,
  Loader2,
  LogOut,
  MessageCircle,
  Mic,
  Minus,
  Monitor,
  PartyPopper,
  Pause,
  Pencil,
  Play,
  Plus,
  Rocket,
  RotateCcw,
  RotateCw,
  Settings,
  Sparkles,
  Sprout,
  Square,
  Star,
  Target,
  Ticket,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Unlock,
  User,
  UserPlus,
  Wallet,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

/**
 * Keys are stable even if we swap icon libraries later.
 * Add new icons here as we standardise the UI.
 */
export const ICON_MAP = {
  // Status + health
  "check-circle": CheckCircle2,
  check: Check,
  "check-double": CheckCheck,
  eye: Eye,
  rocket: Rocket,
  "hand-heart": HandHeart,
  flame: Flame,
  star: Star,
  sprout: Sprout,

  // Navigation + actions
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  plus: Plus,
  minus: Minus,
  "user-plus": UserPlus,
  x: X,
  pencil: Pencil,
  trash: Trash2,

  // Time + schedule
  calendar: Calendar,
  "calendar-check": CalendarCheck,
  "calendar-clock": CalendarClock,
  clock: Clock,
  hourglass: Hourglass,

  // Charts + reporting
  "chart-bar": BarChart3,
  "chart-line": LineChart,
  "triangle-alert": TriangleAlert,
  target: Target,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,

  // Content + guidance
  lightbulb: Lightbulb,
  heart: Heart,
  book: Book,
  "book-open": BookOpen,
  info: Info,
  "message-circle": MessageCircle,
  bolt: Zap,
  "graduation-cap": GraduationCap,
  "circle-question": CircleHelp,

  // Accounts + auth
  user: User,
  "log-out": LogOut,

  // Misc UI
  settings: Settings,
  "rotate-ccw": RotateCcw,
  "rotate-cw": RotateCw,
  "party-popper": PartyPopper,
  circle: Circle,

  // Media / audio
  mic: Mic,
  play: Play,
  pause: Pause,
  stop: Square,

  // Premium / states
  unlock: Unlock,
  loader: Loader2,

  // "AI" / magic
  sparkles: Sparkles,
  "wand-sparkles": WandSparkles,

  // FEAT-013: Rewards system
  gift: Gift,
  wallet: Wallet,
  coins: Coins,
  monitor: Monitor,
  candy: Candy,
  ticket: Ticket,
  crown: Crown,
} as const;

export type IconKey = keyof typeof ICON_MAP;

type BaseProps = {
  className?: string;
  title?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
};

type Props =
  | (BaseProps & { name: IconKey; icon?: never })
  | (BaseProps & { icon: LucideIcon; name?: never });

export function hasIcon(name: string): name is IconKey {
  return Object.prototype.hasOwnProperty.call(ICON_MAP, name);
}

export default function AppIcon({
  name,
  icon,
  className = "w-5 h-5",
  title,
  style,
  "aria-hidden": ariaHidden = true,
  "aria-label": ariaLabel,
}: Props) {
  const Icon: LucideIcon | undefined =
    icon ?? (name ? ICON_MAP[name] : undefined);

  if (!Icon) {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn("[AppIcon] Missing icon for:", { name });
    }
    return null;
  }

  return (
    <Icon
      className={className}
      style={style}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : ariaLabel}
      title={title}
    />
  );
}
