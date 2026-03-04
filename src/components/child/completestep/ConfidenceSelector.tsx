// src/components/child/completestep/ConfidenceSelector.tsx

import type { ConfidenceLevel } from "../../../types/child/completestep";
import { CONFIDENCE_OPTIONS } from "../../../services/child/completestep";
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
      variant="grid"
    />
  );
}
