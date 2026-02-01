// src/hooks/child/summarystep/useSummaryStep.ts

import { useState, useCallback } from "react";
import { MnemonicStyle, MnemonicData } from "../../../types/child/summarystep";

interface UseSummaryStepProps {
  initialSelectedStyle?: MnemonicStyle | null;
  initialMnemonic?: MnemonicData | null;
}

export function useSummaryStep({
  initialSelectedStyle,
  initialMnemonic,
}: UseSummaryStepProps) {
  const [selectedStyle, setSelectedStyle] = useState<MnemonicStyle | null>(
    initialSelectedStyle ?? null
  );
  const [mnemonic, setMnemonic] = useState<MnemonicData | null>(initialMnemonic ?? null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectStyle = useCallback((style: MnemonicStyle) => {
    setSelectedStyle(style);
  }, []);

  return {
    selectedStyle,
    mnemonic,
    isGenerating,
    setMnemonic,
    setIsGenerating,
    handleSelectStyle,
  };
}
