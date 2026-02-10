// src/components/parent/rewards/RewardEditor.tsx
// FEAT-013: Add/Edit Reward Modal Component

import React, { useState } from 'react';
import AppIcon from '../../ui/AppIcon';
import type { 
  ChildReward, 
  RewardCategory, 
  RewardFormData,
  LimitType 
} from '../../../types/parent/rewardTypes';

interface RewardEditorProps {
  reward?: ChildReward;
  categories: RewardCategory[];
  onSave: (reward: RewardFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function RewardEditor({
  reward,
  categories,
  onSave,
  onCancel,
  isSaving,
}: RewardEditorProps) {
  const [formData, setFormData] = useState<RewardFormData>({
    id: reward?.id,
    category_id: reward?.category_id || categories[0]?.id || '',
    template_id: reward?.template_id || undefined,
    name: reward?.name || '',
    points_cost: reward?.points_cost || 100,
    emoji: reward?.emoji || '',
    limit_type: reward?.limit_type ?? undefined,
    limit_count: reward?.limit_count || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCategory = categories.find(c => c.id === formData.category_id);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Reward name is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (formData.points_cost < 1) {
      newErrors.points_cost = 'Points must be at least 1';
    }

    if (formData.limit_type && !formData.limit_count) {
      newErrors.limit_count = 'Please set a limit count';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = selectedCategory?.templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        name: template.name,
        points_cost: template.suggested_points,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-neutral-0 rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-neutral-0 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
            {reward ? 'Edit Reward' : 'Add New Reward'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
            aria-label="Close"
          >
            <AppIcon name="x" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.filter(c => c.code !== 'custom').map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    category_id: category.id,
                    template_id: undefined,
                  }))}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    formData.category_id === category.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            {errors.category_id && (
              <p className="text-danger text-sm mt-1">{errors.category_id}</p>
            )}
          </div>

          {/* Template Quick Select */}
          {selectedCategory && selectedCategory.templates.length > 0 && !reward && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Quick Select (Optional)
              </label>
              <div className="space-y-2">
                {selectedCategory.templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition-colors ${
                      formData.template_id === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-sm text-neutral-900">{template.name}</span>
                    <span className="text-sm text-neutral-500">{template.suggested_points} pts</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reward Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Reward Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., 30 minutes extra gaming"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? 'border-danger' : 'border-neutral-300'
              }`}
            />
            {errors.name && (
              <p className="text-danger text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Points Cost */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Points Cost
            </label>
            <input
              type="number"
              min="1"
              value={formData.points_cost}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                points_cost: parseInt(e.target.value) || 0 
              }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.points_cost ? 'border-danger' : 'border-neutral-300'
              }`}
            />
            {errors.points_cost && (
              <p className="text-danger text-sm mt-1">{errors.points_cost}</p>
            )}
          </div>

          {/* Limit Settings */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Limit (Optional)
            </label>
            <div className="flex gap-2">
              <select
                value={formData.limit_type || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  limit_type: (e.target.value || null) as LimitType,
                  limit_count: e.target.value ? (prev.limit_count || 1) : undefined,
                }))}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">No limit</option>
                <option value="per_day">Per day</option>
                <option value="per_week">Per week</option>
                <option value="per_month">Per month</option>
              </select>
              {formData.limit_type && (
                <input
                  type="number"
                  min="1"
                  value={formData.limit_count || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    limit_count: parseInt(e.target.value) || undefined 
                  }))}
                  placeholder="Max"
                  className={`w-24 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.limit_count ? 'border-danger' : 'border-neutral-300'
                  }`}
                />
              )}
            </div>
            {errors.limit_count && (
              <p className="text-danger text-sm mt-1">{errors.limit_count}</p>
            )}
            {formData.limit_type && formData.limit_count && (
              <p className="text-xs text-neutral-500 mt-1">
                Maximum {formData.limit_count} time{formData.limit_count > 1 ? 's' : ''} {' '}
                {formData.limit_type.replace('per_', 'per ')}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-neutral-0 pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-neutral-100 mt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
            >
              {isSaving ? (
                <>
                  <AppIcon name="loader" className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                reward ? 'Save Changes' : 'Add Reward'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RewardEditor;