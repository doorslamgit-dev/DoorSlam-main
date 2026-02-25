// src/components/ui/index.ts
/**
 * UI Component Library Exports
 * ============================
 * Central export file for all reusable UI components.
 *
 * Usage:
 * import { Button, Card, Alert } from '@/components/ui';
 */

// ── DoorSlam components (shadcn-based with compat API) ──
export { default as Button, buttonVariants } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export { default as Card, CardRoot, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants } from "./Card";
export type { CardProps, CardVariant, CardPadding } from "./Card";

export { default as Alert, AlertRoot, AlertTitle, AlertDescription, alertVariants } from "./Alert";
export type { AlertProps, AlertVariant } from "./Alert";

export { default as Modal } from "./Modal";
export type { ModalProps } from "./Modal";

export { default as Badge, badgeVariants, STATUS_TO_BADGE_VARIANT } from "./Badge";
export type { BadgeProps, BadgeVariant, BadgeSize, BadgeStyle } from "./Badge";

export { default as FormField } from "./FormField";
export type { InputProps, TextareaProps } from "./FormField";

export { default as Toggle } from "./Toggle";
export type { ToggleProps, ToggleSize } from "./Toggle";

// Feedback Components
export { default as LoadingSpinner } from "./LoadingSpinner";
export type { LoadingSpinnerProps, SpinnerSize, SpinnerVariant } from "./LoadingSpinner";

export { default as EmptyState } from "./EmptyState";
export type { EmptyStateProps, EmptyStateVariant } from "./EmptyState";

export { default as ProgressBar } from "./ProgressBar";
export type { ProgressBarProps, ProgressBarColor, ProgressBarSize } from "./ProgressBar";

export { default as StatCard } from "./StatCard";
export type { StatCardProps, StatCardSize, StatCardValueColor, StatCardBackground } from "./StatCard";

export { default as IconCircle } from "./IconCircle";
export type { IconCircleProps, IconCircleSize, IconCircleColor, IconCircleVariant } from "./IconCircle";

export { default as CircularProgress } from "./CircularProgress";
export type { CircularProgressProps, CircularProgressColorToken, CircularProgressSizePreset } from "./CircularProgress";

export { default as AvatarCircle } from "./AvatarCircle";
export type { AvatarCircleProps, AvatarCircleSize, AvatarCircleColor } from "./AvatarCircle";

export { default as AppIcon } from "./AppIcon";
export type { IconKey } from "./AppIcon";

export { default as ThemeToggle } from "./ThemeToggle";

// Overlay Components
export { default as DropdownMenu } from "./DropdownMenu";
export type { DropdownMenuProps, DropdownMenuItem } from "./DropdownMenu";

export { ToastProvider, useToast } from "./Toast";
export type { ToastData, ToastInput, ToastVariant } from "./Toast";

// Note: ErrorBoundary is at src/components/ErrorBoundary.tsx (not in ui folder)

// ── shadcn primitives (direct imports for advanced use) ──
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "./dialog";
export { Input } from "./input";
export { Textarea } from "./textarea";
export { Label } from "./label";
export { Progress } from "./progress";
export { Separator } from "./separator";
export { Skeleton } from "./skeleton";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
export { DropdownMenu as ShadcnDropdownMenu, DropdownMenuContent, DropdownMenuItem as ShadcnDropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./dropdown-menu";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "./select";
export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "./sheet";
export { Switch } from "./switch";
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
