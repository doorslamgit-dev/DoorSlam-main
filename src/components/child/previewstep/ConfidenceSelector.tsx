// src/components/child/previewstep/ConfidenceSelector.tsx

import type { ConfidenceLevel } from "../../../types/child/previewstep";
import { CONFIDENCE_OPTIONS } from "../../../services/child/previewstep";
import { ConfidenceSelector as SharedConfidenceSelector } from "../session/ConfidenceSelector";

interface ConfidenceSelectorProps {
  selected: ConfidenceLevel | null;
  onSelect: (level: ConfidenceLevel) => void;
  disabled: boolean;
}

export function ConfidenceSelector({ selected, onSelect, disabled }: ConfidenceSelectorProps) {
  return (
    <SharedConfidenceSelector
      options={CONFIDENCE_OPTIONS}
      selected={selected}
      onSelect={(id) => onSelect(id as ConfidenceLevel)}
      disabled={disabled}
      variant="list"
    />
  );
}
