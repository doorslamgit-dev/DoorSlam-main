// src/components/child/summarystep/KeyTakeawayCard.tsx

import { KeyTakeaway } from "../../../types/child/summarystep";

interface KeyTakeawayCardProps {
  takeaway: KeyTakeaway;
  index: number;
}

export function KeyTakeawayCard({ takeaway, index }: KeyTakeawayCardProps) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl">
      <div className="w-10 h-10 bg-accent-green rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold">{index + 1}</span>
      </div>
      <p className="flex-1 text-neutral-800 font-semibold text-lg">{takeaway.description}</p>
    </div>
  );
}
