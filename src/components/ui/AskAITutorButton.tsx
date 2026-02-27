// src/components/ui/AskAITutorButton.tsx
// Reusable CTA button for opening the AI Tutor. Use everywhere AI Tutor is surfaced.

import Button from './Button';
import { cn } from '@/lib/utils';

interface AskAITutorButtonProps {
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

export default function AskAITutorButton({ onClick, className, fullWidth }: AskAITutorButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      leftIcon="sparkles"
      fullWidth={fullWidth}
      onClick={onClick}
      className={cn('text-primary border-primary hover:bg-primary/5 [&_svg]:text-lime', className)}
    >
      Ask AI Tutor
    </Button>
  );
}
