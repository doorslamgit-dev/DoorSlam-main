// src/components/child/summarystep/MnemonicNotAvailable.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface MnemonicNotAvailableProps {
  subjectName: string;
}

export function MnemonicNotAvailable({ subjectName }: MnemonicNotAvailableProps) {
  return (
    <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
          <AppIcon name={"music" as IconKey} className="text-neutral-400 text-lg" />
        </div>

        <div>
          <h3 className="font-semibold text-neutral-700 mb-2">
            Memory songs aren't available for {subjectName}
          </h3>
          <p className="text-neutral-600 text-sm">
            Songs work best for subjects with formulas, dates, or sequences to remember. For this
            subject, focus on understanding the key points above!
          </p>
        </div>
      </div>
    </div>
  );
}
