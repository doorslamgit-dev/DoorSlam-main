// src/components/admin/curriculum/CliCommand.tsx
// Reusable CLI command display with copy-to-clipboard button.

import { useState } from 'react';
import Button from '@/components/ui/Button';
import AppIcon from '@/components/ui/AppIcon';

interface CliCommandProps {
  label: string;
  command: string;
}

export default function CliCommand({ label, command }: CliCommandProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded((v) => !v)}
        rightIcon={expanded ? 'chevron-up' : 'chevron-down'}
      >
        {label}
      </Button>
      {expanded && (
        <div className="mt-2 relative">
          <pre className="bg-muted rounded-lg p-3 text-xs text-foreground overflow-x-auto font-mono">
            {command}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-background border border-border hover:bg-accent transition-colors"
            title="Copy to clipboard"
          >
            <AppIcon
              name={copied ? 'check' : 'copy'}
              className="w-3.5 h-3.5 text-muted-foreground"
            />
          </button>
        </div>
      )}
    </div>
  );
}
