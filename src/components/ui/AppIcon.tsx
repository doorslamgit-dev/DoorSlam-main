// src/components/ui/AppIcon.tsx
// Centralised Lucide icon wrapper + icon registry
// FEAT-010: Single source of truth for UI icons
// FEAT-013: Added reward system icons (gift, wallet, pencil, trash, monitor, candy, ticket, crown)

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Atom,
  BadgeCheck,
  BarChart3,
  Battery,
  Bell,
  Book,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Calculator,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarX,
  Candy,
  Check,
  CheckCheck,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleCheck,
  CircleHelp,
  CircleX,
  Clipboard,
  ClipboardList,
  Clock,
  Cloud,
  Coffee,
  Coins,
  Copy,
  Crown,
  Disc,
  Dna,
  Download,
  Dumbbell,
  Expand,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FileText,
  Fingerprint,
  Flame,
  FlaskConical,
  Folder,
  Gauge,
  Gift,
  Globe,
  GraduationCap,
  Grip,
  GripVertical,
  Guitar,
  Hand,
  HandHeart,
  Headphones,
  Heart,
  History,
  Home,
  Hourglass,
  Image,
  Info,
  Key,
  Landmark,
  Languages,
  Laptop,
  Layout,
  LayoutGrid,
  Leaf,
  Lightbulb,
  LineChart,
  Link,
  ListChecks,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Map,
  MapPin,
  Maximize,
  Menu,
  MessageCircle,
  Mic,
  Microscope,
  Minimize,
  Minus,
  Monitor,
  Moon,
  MoreVertical,
  Music,
  Music2,
  Palette,
  PartyPopper,
  Pause,
  Pencil,
  PieChart,
  Plane,
  Play,
  Plus,
  PlusCircle,
  Printer,
  Rocket,
  RotateCcw,
  RotateCw,
  Save,
  Scale,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Shuffle,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sprout,
  Square,
  Star,
  Sun,
  Target,
  Ticket,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Undo2,
  Unlock,
  Upload,
  User,
  UserPlus,
  Users,
  Utensils,
  Volume2,
  VolumeX,
  Wallet,
  Wand2,
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
  checkCircle: CheckCircle2, // camelCase alias
  "circle-check": CircleCheck,
  circleCheck: CircleCheck, // camelCase alias
  check: Check,
  "check-double": CheckCheck,
  "check-square": CheckSquare,
  checkSquare: CheckSquare, // camelCase alias
  "badge-check": BadgeCheck,
  badgeCheck: BadgeCheck, // camelCase alias
  eye: Eye,
  "eye-off": EyeOff,
  rocket: Rocket,
  "hand-heart": HandHeart,
  flame: Flame,
  fire: Flame, // alias
  star: Star,
  sprout: Sprout,
  trophy: Trophy,
  "alert-circle": AlertCircle,
  alertCircle: AlertCircle, // camelCase alias
  "info-circle": Info,
  infoCircle: Info, // camelCase alias
  activity: Activity,
  "battery-full": Battery,
  batteryFull: Battery, // camelCase alias

  // Navigation + actions
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  arrowRight: ArrowRight, // camelCase alias
  "arrow-up": ArrowUp,
  arrowUp: ArrowUp, // camelCase alias
  "arrow-down": ArrowDown,
  arrowDown: ArrowDown, // camelCase alias
  "chevron-left": ChevronLeft,
  chevronLeft: ChevronLeft, // camelCase alias
  "chevron-down": ChevronDown,
  chevronDown: ChevronDown, // camelCase alias
  "chevron-right": ChevronRight,
  chevronRight: ChevronRight, // camelCase alias
  "chevron-up": ChevronUp,
  chevronUp: ChevronUp, // camelCase alias
  plus: Plus,
  "plus-circle": PlusCircle,
  plusCircle: PlusCircle, // camelCase alias
  minus: Minus,
  "user-plus": UserPlus,
  x: X,
  close: X, // alias
  cross: X, // alias
  "x-circle": CircleX,
  xCircle: CircleX, // camelCase alias
  pencil: Pencil,
  edit: Pencil, // alias
  "trash-2": Trash2,
  trash: Trash2, // alias
  grip: Grip,
  "grip-vertical": GripVertical,
  save: Save,
  search: Search,
  "sliders-horizontal": SlidersHorizontal,
  upload: Upload,
  download: Download,
  copy: Copy,
  clipboard: Clipboard,
  "clipboard-list": ClipboardList,
  clipboardList: ClipboardList, // camelCase alias
  share: Share2,
  "external-link": ExternalLink,
  link: Link,
  undo: Undo2,
  menu: Menu,
  "more-vertical": MoreVertical,
  moreVertical: MoreVertical, // camelCase alias

  // Time + schedule
  calendar: Calendar,
  "calendar-check": CalendarCheck,
  calendarCheck: CalendarCheck, // camelCase alias
  "calendar-clock": CalendarClock,
  calendarClock: CalendarClock, // camelCase alias
  "calendar-x": CalendarX,
  calendarX: CalendarX, // camelCase alias
  "calendar-plus": CalendarPlus,
  calendarPlus: CalendarPlus, // camelCase alias
  "calendar-week": CalendarDays,
  calendarWeek: CalendarDays, // camelCase alias
  "calendar-days": CalendarDays,
  calendarDays: CalendarDays, // camelCase alias
  clock: Clock,
  hourglass: Hourglass,
  history: History,

  // Charts + reporting
  "chart-bar": BarChart3,
  "chart-line": LineChart,
  "pie-chart": PieChart,
  pieChart: PieChart, // camelCase alias
  "triangle-alert": TriangleAlert,
  triangleAlert: TriangleAlert, // camelCase alias
  "triangle-exclamation": TriangleAlert,
  triangleExclamation: TriangleAlert, // camelCase alias
  "alert-triangle": TriangleAlert, // alias
  alertTriangle: TriangleAlert, // camelCase alias
  target: Target,
  "trending-up": TrendingUp,
  trending: TrendingUp, // alias
  "trending-down": TrendingDown,

  // Content + guidance
  lightbulb: Lightbulb,
  heart: Heart,
  book: Book,
  "book-open": BookOpen,
  bookOpen: BookOpen, // camelCase alias
  info: Info,
  "message-circle": MessageCircle,
  chat: MessageCircle, // alias
  bolt: Zap,
  zap: Zap,
  "graduation-cap": GraduationCap,
  "circle-question": CircleHelp,
  "question-circle": CircleHelp,
  questionCircle: CircleHelp, // camelCase alias
  question: CircleHelp, // alias
  printer: Printer,

  // Accounts + auth
  user: User,
  users: Users,
  "log-out": LogOut,
  lock: Lock,
  key: Key,
  mail: Mail,
  shield: Shield,
  "shield-check": ShieldCheck,
  fingerprint: Fingerprint,

  // Misc UI
  settings: Settings,
  "rotate-ccw": RotateCcw,
  "rotate-cw": RotateCw,
  refresh: RotateCw, // alias
  "party-popper": PartyPopper,
  circle: Circle,
  plane: Plane,
  coffee: Coffee,
  sun: Sun,
  moon: Moon,
  home: Home,
  bell: Bell,
  "help-circle": CircleHelp, // alias
  "circle-help": CircleHelp, // alias
  cloud: Cloud,
  map: Map,
  "map-pin": MapPin,
  folder: Folder,
  image: Image,
  "file-text": FileText,
  file: File,
  layout: Layout,
  "layout-grid": LayoutGrid,
  layoutGrid: LayoutGrid, // camelCase alias
  expand: Expand,
  minimize: Minimize,
  maximize: Maximize,
  wand: Wand2,
  briefcase: Briefcase,

  // Subject icons
  calculator: Calculator,
  "flask-conical": FlaskConical,
  atom: Atom,
  globe: Globe,
  landmark: Landmark,
  dna: Dna,
  languages: Languages,
  palette: Palette,
  music: Music,
  microscope: Microscope,
  laptop: Laptop,
  dumbbell: Dumbbell,
  hands: Hand,
  drama: Music, // Drama/performing arts (using music as creative arts icon)
  leaf: Leaf,
  utensils: Utensils,
  scale: Scale,
  "person-standing": User, // PE/Physical activities
  guitar: Guitar,
  robot: Bot,
  bot: Bot,
  brain: Brain,
  mobile: Smartphone,
  "list-check": ListChecks,
  listCheck: ListChecks, // camelCase alias
  gauge: Gauge,
  shuffle: Shuffle,

  // Media / audio
  mic: Mic,
  microphone: Mic, // alias
  play: Play,
  pause: Pause,
  stop: Square,
  volume: Volume2,
  volumeUp: Volume2, // camelCase alias
  "volume-off": VolumeX,
  volumeOff: VolumeX, // camelCase alias
  volumeMute: VolumeX, // camelCase alias
  headphones: Headphones,
  disc: Disc,
  musicNote: Music2,
  "music-note": Music2,

  // Premium / states
  unlock: Unlock,
  loader: Loader2,
  spinner: Loader2, // alias
  "warning-triangle": TriangleAlert,
  warningTriangle: TriangleAlert, // camelCase alias
  send: Send,

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
  | (BaseProps & { name: IconKey | string; icon?: never })
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
    icon ?? (name && hasIcon(name) ? ICON_MAP[name] : undefined);

  if (!Icon) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("[AppIcon] Missing icon for:", { name });
    }
    return null;
  }

  // Wrap in span if title is provided (Lucide icons don't support title prop directly)
  if (title) {
    return (
      <span title={title} style={{ display: "inline-flex" }}>
        <Icon
          className={className}
          style={style}
          aria-hidden={ariaHidden}
          aria-label={ariaHidden ? undefined : ariaLabel}
        />
      </span>
    );
  }

  return (
    <Icon
      className={className}
      style={style}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : ariaLabel}
    />
  );
}