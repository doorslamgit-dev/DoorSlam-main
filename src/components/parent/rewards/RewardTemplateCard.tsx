// src/components/parent/rewards/RewardTemplateCard.tsx
// FEAT-013: Reusable reward card for catalog and agreed rewards

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

// Helper: Get style classes for category
function getCategoryStyle(code: CategoryCode | string): { 
  bg: string; 
  text: string; 
  border: string; 
  lightBg: string 
} {
  const styles: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    screen_time: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', lightBg: 'bg-blue-50' },
    treats: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200', lightBg: 'bg-pink-50' },
    activities: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', lightBg: 'bg-green-50' },
    pocket_money: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', lightBg: 'bg-amber-50' },
    privileges: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', lightBg: 'bg-purple-50' },
    custom: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', lightBg: 'bg-gray-50' },
  };
  return styles[code] || styles.custom;
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

  const style = getCategoryStyle(categoryCode);
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
      <div className={`rounded-xl border-2 p-3 ${style.lightBg} ${style.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/80`}>
            <AppIcon name={icon} className={`w-4 h-4 ${style.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            <p className="text-sm font-bold text-purple-600">{pointsCost} pts</p>
          </div>
          {showEditPoints && childRewardId && onUpdatePoints && (
            <button
              onClick={handleStartEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded"
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
          ? `${style.lightBg} ${style.border}`
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isEnabled ? 'bg-white/80' : 'bg-white'
        }`}>
          <AppIcon 
            name={icon} 
            className={`w-5 h-5 ${isEnabled ? style.text : 'text-gray-400'}`} 
          />
        </div>

        {/* Toggle Switch */}
        {showToggle && onToggle && (
          <button
            onClick={() => onToggle(id, isEnabled)}
            disabled={isToggling}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isEnabled ? 'bg-purple-600' : 'bg-gray-300'
            } ${isToggling ? 'opacity-50' : ''}`}
            role="switch"
            aria-checked={isEnabled}
            aria-label={`Toggle ${name}`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>

      {/* Name */}
      <h3 className={`font-medium mb-1 ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
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
          <p className={`text-lg font-bold ${isEnabled ? 'text-purple-600' : 'text-gray-400'}`}>
            {pointsCost} pts
          </p>
          {showEditPoints && isEnabled && childRewardId && onUpdatePoints && (
            <button
              onClick={handleStartEdit}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded"
              aria-label="Edit points"
            >
              <AppIcon name="pencil" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Suggested points hint if different */}
      {isEnabled && suggestedPoints && pointsCost !== suggestedPoints && (
        <p className="text-xs text-gray-400 mt-1">
          Suggested: {suggestedPoints} pts
        </p>
      )}
    </div>
  );
}