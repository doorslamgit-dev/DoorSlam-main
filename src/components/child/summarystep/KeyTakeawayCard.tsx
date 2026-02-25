// src/components/child/summarystep/KeyTakeawayCard.tsx

import { KeyTakeaway } from "../../../types/child/summarystep";

interface KeyTakeawayCardProps {
  takeaway: KeyTakeaway;
  index: number;
}

export function KeyTakeawayCard({ takeaway, index }: KeyTakeawayCardProps) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-muted rounded-xl">
      <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold">{index + 1}</span>
      </div>
      <p className="flex-1 text-foreground font-semibold text-lg">{takeaway.description}</p>
    </div>
  );
}
