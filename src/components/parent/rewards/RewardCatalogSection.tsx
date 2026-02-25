// src/components/parent/rewards/RewardCatalogSection.tsx
// FEAT-013: Full catalog by category with toggleable templates

import AppIcon from '../../ui/AppIcon';
import { RewardTemplateCard } from './RewardTemplateCard';
import type { RewardCategory, CategoryCode } from '../../../types/parent/rewardTypes';

// Helper: Get icon name for category
function getCategoryIcon(code: string): string {
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
function getCategoryStyle(code: string): { bg: string; text: string } {
  const styles: Record<string, { bg: string; text: string }> = {
    screen_time: { bg: 'bg-info/10', text: 'text-info' },
    treats: { bg: 'bg-pink-100', text: 'text-pink-600' },
    activities: { bg: 'bg-success/10', text: 'text-success' },
    pocket_money: { bg: 'bg-warning/10', text: 'text-warning' },
    privileges: { bg: 'bg-primary/10', text: 'text-primary' },
    custom: { bg: 'bg-secondary', text: 'text-muted-foreground' },
  };
  return styles[code] || styles.custom;
}

interface RewardCatalogSectionProps {
  categories: RewardCategory[];
  onToggleTemplate: (templateId: string, currentEnabled: boolean) => void;
  onUpdatePoints: (rewardId: string, points: number) => void;
  togglingTemplate: string | null;
}

export function RewardCatalogSection({
  categories,
  onToggleTemplate,
  onUpdatePoints,
  togglingTemplate,
}: RewardCatalogSectionProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary">
          <AppIcon name="layout-grid" className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Reward Catalog</h2>
          <p className="text-sm text-muted-foreground">Toggle rewards on to make them available</p>
        </div>
      </div>

      {/* Categories */}
      {categories.map((category) => {
        if (!category.templates || category.templates.length === 0) return null;
        
        const style = getCategoryStyle(category.code);
        const enabledInCategory = category.templates.filter(t => t.is_enabled).length;

        return (
          <div key={category.id} className="bg-background rounded-xl border border-border p-4 sm:p-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.bg}`}>
                <AppIcon name={getCategoryIcon(category.code)} className={`w-4 h-4 ${style.text}`} />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{category.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {enabledInCategory} of {category.templates.length} enabled
                </p>
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.templates.map((template) => (
                <RewardTemplateCard
                  key={template.id}
                  id={template.id}
                  name={template.name}
                  pointsCost={template.points_cost}
                  suggestedPoints={template.suggested_points}
                  categoryCode={category.code as CategoryCode}
                  isEnabled={template.is_enabled}
                  childRewardId={template.child_reward_id}
                  onToggle={onToggleTemplate}
                  onUpdatePoints={onUpdatePoints}
                  isToggling={togglingTemplate === template.id}
                  showToggle={true}
                  showEditPoints={true}
                  compact={false}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}