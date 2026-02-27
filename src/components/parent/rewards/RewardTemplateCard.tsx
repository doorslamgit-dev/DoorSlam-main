// src/components/parent/rewards/RewardTemplateCard.tsx
// FEAT-013: Reusable reward card for catalog and agreed rewards
// Updated: Simplified to lime (active) / muted (inactive) styling

import { useState } from 'react';
import AppIcon from '../../ui/AppIcon';
import { PointsEditor } from './PointsEditor';
import type { CategoryCode } from '../../../types/parent/rewardTypes';

// Helper: Get icon name for category
function getCategoryIcon(code: CategoryCode | string): string {
  const icons: Record<string, string> = {
    screen_time: 'monitor',
    treats: 'candy',
    activities: 'ticket',
    pocket_money: 'wallet',
    privileges: 'crown',
    custom: 'gift',
  };
  return icons[code] || 'gift';
}

interface RewardTemplateCardProps {
  id: string;
  name: string;
  pointsCost: number;
  suggestedPoints?: number;
  categoryCode: CategoryCode | string;
  isEnabled: boolean;
  childRewardId?: string | null;
  onToggle?: (id: string, currentEnabled: boolean) => void;
  onUpdatePoints?: (rewardId: string, points: number) => void;
  isToggling?: boolean;
  showToggle?: boolean;
  showEditPoints?: boolean;
  compact?: boolean;
}

export function RewardTemplateCard({
  id,
  name,
  pointsCost,
  suggestedPoints,
  categoryCode,
  isEnabled,
  childRewardId,
  onToggle,
  onUpdatePoints,
  isToggling = false,
  showToggle = true,
  showEditPoints = true,
  compact = false,
}: RewardTemplateCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(pointsCost);

  const icon = getCategoryIcon(categoryCode);

  const handleSavePoints = () => {
    if (onUpdatePoints && childRewardId) {
      onUpdatePoints(childRewardId, editValue);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(pointsCost);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditValue(pointsCost);
    setIsEditing(true);
  };

  if (compact) {
    // Compact mode for AgreedRewardsCard
    return (
      <div className={`rounded-xl border-2 p-3 ${isEnabled ? 'bg-lime/10 border-lime/30' : 'bg-muted border-border'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background">
            <AppIcon name={icon} className={`w-4 h-4 ${isEnabled ? 'text-lime' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{name}</p>
            <p className={`text-sm font-bold ${isEnabled ? 'text-lime' : 'text-muted-foreground'}`}>{pointsCost} pts</p>
          </div>
          {showEditPoints && childRewardId && onUpdatePoints && (
            <button
              onClick={handleStartEdit}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
              aria-label="Edit points"
            >
              <AppIcon name="pencil" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full card mode for catalog
  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        isEnabled
          ? 'bg-lime/10 border-lime/30'
          : 'bg-muted border-border'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-background">
          <AppIcon
            name={icon}
            className={`w-5 h-5 ${isEnabled ? 'text-lime' : 'text-muted-foreground'}`}
          />
        </div>

        {/* Toggle Switch */}
        {showToggle && onToggle && (
          <button
            onClick={() => onToggle(id, isEnabled)}
            disabled={isToggling}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
            } ${isToggling ? 'opacity-50' : ''}`}
            role="switch"
            aria-checked={isEnabled}
            aria-label={`Toggle ${name}`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-background rounded-full shadow transition-transform ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>

      {/* Name */}
      <h3 className={`font-medium mb-1 ${isEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
        {name}
      </h3>

      {/* Points - editable if enabled */}
      {isEditing ? (
        <PointsEditor
          value={editValue}
          onChange={setEditValue}
          onSave={handleSavePoints}
          onCancel={handleCancelEdit}
        />
      ) : (
        <div className="flex items-center gap-2">
          <p className={`text-lg font-bold ${isEnabled ? 'text-lime' : 'text-muted-foreground'}`}>
            {pointsCost} pts
          </p>
          {showEditPoints && isEnabled && childRewardId && onUpdatePoints && (
            <button
              onClick={handleStartEdit}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
              aria-label="Edit points"
            >
              <AppIcon name="pencil" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Suggested points hint if different */}
      {isEnabled && suggestedPoints && pointsCost !== suggestedPoints && (
        <p className="text-xs text-muted-foreground mt-1">
          Suggested: {suggestedPoints} pts
        </p>
      )}
    </div>
  );
}
